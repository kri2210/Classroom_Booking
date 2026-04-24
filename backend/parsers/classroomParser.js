/**
 * classroomParser.js — uses exceljs (no known vulnerabilities)
 *
 * Parses "FEST Classroom Occupancy.xlsx" — single sheet, rooms listed vertically.
 *
 *   Row N:   "Classroom No : CR4"
 *   Row N+1: TIME | MON | TUE | WED | THU | FRI
 *   Row N+2: "9:10 to 10:00" | "7-CIE" | "" | ...
 *   Row M:   "Classroom No : CR5"   ← next room block
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

function isNumericOnly(str) {
  return /^\s*-?\d+(\.\d+)?\s*$/.test(str);
}

/** Get cell value as plain string, handling rich-text / formula cells */
function getCellText(cell) {
  if (!cell || cell.value === null || cell.value === undefined) return '';
  const v = cell.value;
  if (typeof v === 'object' && v.richText) return v.richText.map(r => r.text).join('');
  if (typeof v === 'object' && v.result !== undefined) return String(v.result);
  return String(v);
}

/**
 * @param {Buffer} buffer
 * @returns {Promise<Array>}
 */
async function parseClassroomExcel(buffer) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const sheet = workbook.worksheets[0];
  const entries = [];

  let currentRoom = null;
  let dayColumns = [];     // [{ colIdx (1-based), dayName }]
  let expectingHeader = false;

  sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    const firstCell = getCellText(row.getCell(1)).trim();

    // ── Detect "Classroom No : CR4" ──
    const roomMatch = firstCell.match(/Classroom\s*No\s*[:.]\s*(.+)/i);
    if (roomMatch) {
      currentRoom = roomMatch[1].trim();
      dayColumns = [];
      expectingHeader = true;
      return;
    }

    if (!currentRoom) return;

    // ── Detect TIME | MON | TUE | ... header ──
    if (expectingHeader && firstCell.toUpperCase() === 'TIME') {
      dayColumns = [];
      row.eachCell({ includeEmpty: false }, (cell, colIdx) => {
        const key = getCellText(cell).trim().toUpperCase();
        if (DAY_COL_MAP[key]) dayColumns.push({ colIdx, dayName: DAY_COL_MAP[key] });
      });
      expectingHeader = false;
      return;
    }

    // ── Parse time data row ──
    const timeMatch = firstCell.match(/(\d{1,2}[:.]?\d{2})\s*(?:to|-)\s*(\d{1,2}[:.]?\d{2})/i);
    if (!timeMatch) return;

    const startTime = normalizeTime(timeMatch[1]);
    const endTime   = normalizeTime(timeMatch[2]);

    for (const { colIdx, dayName } of dayColumns) {
      const raw = getCellText(row.getCell(colIdx)).trim();
      if (!raw || SKIP_LOWER.has(raw.toLowerCase()) || isNumericOnly(raw)) continue;

      entries.push({ roomName: currentRoom, dayOfWeek: dayName, startTime, endTime, label: raw, type: 'classroom' });
    }
  });

  console.log(`[classroomParser] ${entries.length} entries from ${new Set(entries.map(e => e.roomName)).size} rooms`);
  return entries;
}

module.exports = { parseClassroomExcel };
