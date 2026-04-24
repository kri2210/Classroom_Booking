/**
 * labParser.js — uses exceljs (no known vulnerabilities)
 *
 * Room name resolution — two strategies, first one to succeed wins:
 *
 *  Strategy A (sheet name): parse "2F LAB-A", "4F LAB-ADA", "5F LAB-MP" etc.
 *    Generic regex: /(\d+)F\s*LAB[-\s]?([A-Z0-9\-]+)/i
 *    Special cases handled first:
 *      "5F LAB-MP"  → "Lab 5F-MP"
 *      "4F LAB-ADA" → "Lab 4F ADA"
 *      "2F LAB-A"   → "Lab 2A"   (generic)
 *
 *  Strategy B (cell content): scan first 6 rows for
 *    "Floor No. 2" + "Lab No. A" → "Lab 2A" 
 */

const ExcelJS = require('exceljs');

const DAY_COL_MAP = {
  'MON': 'Monday', 'MONDAY': 'Monday',
  'TUE': 'Tuesday', 'TUES': 'Tuesday', 'TUESDAY': 'Tuesday',
  'WED': 'Wednesday', 'WEDNESDAY': 'Wednesday',
  'THU': 'Thursday', 'THUR': 'Thursday', 'THURS': 'Thursday', 'THURSDAY': 'Thursday',
  'FRI': 'Friday', 'FRIDAY': 'Friday',
  'SAT': 'Saturday', 'SATURDAY': 'Saturday',
};

const SKIP_LOWER = new Set(['', 'na', 'n/a', 'break', 'recess', '-', 'free', 'nil', 'lunch']);

function normalizeTime(t) {
  const s = String(t).trim().replace('.', ':');
  const parts = s.split(':');
  if (parts.length < 2) return s;
  return parts[0].padStart(2, '0') + ':' + parts[1].padStart(2, '0');
}

function getCellText(cell) {
  if (!cell || cell.value === null || cell.value === undefined) return '';
  const v = cell.value;
  if (typeof v === 'object' && v.richText) return v.richText.map(r => r.text).join('');
  if (typeof v === 'object' && v.result !== undefined) return String(v.result);
  return String(v);
}

function extractLabel(raw) {
  if (!raw || SKIP_LOWER.has(raw.toLowerCase())) return null;
  const parenMatch = raw.match(/\(([^)]+)\)/);
  if (parenMatch) {
    const inside = parenMatch[1].trim();
    if (/^\d+$/.test(inside)) return raw.split('\n')[0].trim() || raw;
    return inside;
  }
  return raw.split('\n')[0].trim() || raw;
}

// ─── Strategy A: derive room name from the sheet name ────────────────────────
function roomNameFromSheetName(sheetName) {
  const s = sheetName.trim();

  // Special cases — multi-letter lab IDs that need custom output names
  if (/5F.*MP|MP.*5F/i.test(s))        return 'Lab 5F-MP';
  if (/4F.*ADA|ADA/i.test(s))          return 'Lab 4F ADA';

  // Generic: "NF LAB-X", "NF LAB X", "NF LABX", "NF-LAB-X" etc.
  // Captures floor number and lab letter(s)
  const m = s.match(/^(\d+)\s*F\s*[-\s]?\s*LAB\s*[-\s]?\s*([A-Z]+)$/i);
  if (m) {
    const floor = m[1];          // "2", "3", "4", "5"
    const labId = m[2].toUpperCase(); // "A", "B", "C"
    return `Lab ${floor}${labId}`;   // "Lab 2A", "Lab 3B", etc.
  }

  // Looser generic (e.g. "4F LAB-C (old)" or extra characters)
  const m2 = s.match(/(\d+)\s*F.*LAB[-\s]([A-Z]+)/i);
  if (m2) {
    return `Lab ${m2[1]}${m2[2].toUpperCase()}`;
  }

  return null;
}

// ─── Strategy B: derive room name from cell content ──────────────────────────
function roomNameFromCells(rows) {
  let floorNum = null, labLetter = null;
  for (let r = 0; r < Math.min(rows.length, 6); r++) {
    for (const cell of rows[r]) {
      const fm = cell.match(/Floor\s*No\.?\s*(\d+)/i);
      if (fm) floorNum = fm[1];

      const lm = cell.match(/Lab\s*No\.?\s*([A-Z0-9\-]+)/i);
      if (lm) labLetter = lm[1].trim().toUpperCase();
    }
  }

  if (floorNum && labLetter) {
    // Handle special multi-letter IDs
    if (labLetter === 'MP')  return 'Lab 5F-MP';
    if (labLetter === 'ADA') return 'Lab 4F ADA';
    return `Lab ${floorNum}${labLetter}`;
  }
  return null;
}

// ─── Parse one sheet ──────────────────────────────────────────────────────────
function parseSheet(sheet, sheetName) {
  // Collect all rows as flat string arrays
  const rows = [];
  sheet.eachRow({ includeEmpty: true }, (row) => {
    const rowData = [];
    row.eachCell({ includeEmpty: true }, (cell) => rowData.push(getCellText(cell).trim()));
    rows.push(rowData);
  });

  if (!rows || rows.length < 3) return [];

  // Resolve room name
  const roomName = roomNameFromSheetName(sheetName) || roomNameFromCells(rows);
  if (!roomName) {
    console.warn(`[labParser] ⚠ Could not identify room for sheet: "${sheetName}" — skipping`);
    return [];
  }

  // Find TIME | MON | TUE ... header row (search first 8 rows)
  let headerRowIdx = -1;
  const dayColumns = [];

  for (let r = 0; r < Math.min(rows.length, 8); r++) {
    const rowUpper = rows[r].map(c => c.toUpperCase());
    if (rowUpper[0] === 'TIME' && rowUpper.some(v => DAY_COL_MAP[v])) {
      headerRowIdx = r;
      rows[r].forEach((val, ci) => {
        const key = val.toUpperCase();
        if (DAY_COL_MAP[key]) dayColumns.push({ colIdx: ci, dayName: DAY_COL_MAP[key] });
      });
      break;
    }
  }

  if (headerRowIdx === -1 || dayColumns.length === 0) {
    console.warn(`[labParser] ⚠ No TIME header in sheet "${sheetName}"`);
    return [];
  }

  // Parse data rows
  const entries = [];
  for (let r = headerRowIdx + 1; r < rows.length; r++) {
    const row = rows[r];
    const timeMatch = (row[0] || '').match(/(\d{1,2}[:.]?\d{2})\s*(?:to|-)\s*(\d{1,2}[:.]?\d{2})/i);
    if (!timeMatch) continue;

    const startTime = normalizeTime(timeMatch[1]);
    const endTime   = normalizeTime(timeMatch[2]);

    for (const { colIdx, dayName } of dayColumns) {
      const raw = row[colIdx] || '';
      const label = extractLabel(raw);
      if (!label) continue;
      entries.push({ roomName, dayOfWeek: dayName, startTime, endTime, label, type: 'lab' });
    }
  }

  return entries;
}

// ─── Main export ──────────────────────────────────────────────────────────────
async function parseLabExcel(buffer) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  let allEntries = [];

  console.log('\n[labParser] ── Parsing sheets ──');
  for (const sheet of workbook.worksheets) {
    const entries = parseSheet(sheet, sheet.name);
    const room = entries[0]?.roomName || '(skipped)';
    console.log(`  Sheet "${sheet.name}" → ${room} (${entries.length} entries)`);
    allEntries = allEntries.concat(entries);
  }

  const rooms = [...new Set(allEntries.map(e => e.roomName))];
  console.log(`\n[labParser] ✓ ${allEntries.length} entries across ${rooms.length} rooms`);
  console.log(`[labParser] Rooms: ${rooms.join(', ')}\n`);
  return allEntries;
}

module.exports = { parseLabExcel };
