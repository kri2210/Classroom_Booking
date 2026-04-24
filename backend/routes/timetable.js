const express = require('express');
const multer = require('multer');
const router = express.Router();
const supabase = require('../supabaseClient');
const { parseClassroomExcel } = require('../parsers/classroomParser');
const { parseLabExcel } = require('../parsers/labParser');

// Memory storage — we process the buffer directly, no disk writes
const upload = multer({ storage: multer.memoryStorage() });

// ─── GET /api/timetable ───────────────────────────────────────────────────────
// Returns ALL timetable entries from Supabase
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('timetable_entries')
      .select('*');
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('[GET /api/timetable] error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/timetable/upload/classroom ────────────────────────────────────
// Wipes only type='classroom' entries, then inserts new ones
router.post('/upload/classroom', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    // 1. Parse the Excel buffer (async — must await)
    const entries = await parseClassroomExcel(req.file.buffer);
    if (entries.length === 0) {
      return res.status(400).json({ error: 'No valid timetable entries found in the Excel file.' });
    }

    // 2. Delete old classroom timetable rows only
    const { error: delError } = await supabase
      .from('timetable_entries')
      .delete()
      .eq('type', 'classroom');
    if (delError) {
      console.warn('[upload/classroom] delete warning:', delError.message);
    }

    // 3. Insert new rows in chunks of 500
    const CHUNK = 500;
    let inserted = 0;
    for (let i = 0; i < entries.length; i += CHUNK) {
      const chunk = entries.slice(i, i + CHUNK).map(e => ({
        roomName:    e.roomName,
        dayOfWeek:   e.dayOfWeek,
        startTime:   e.startTime,
        endTime:     e.endTime,
        facultyName: e.label,
        source:      'excel',
        type:        'classroom',
      }));
      const { error: insError } = await supabase.from('timetable_entries').insert(chunk);
      if (insError) throw insError;
      inserted += chunk.length;
    }

    const rooms = [...new Set(entries.map(e => e.roomName))];
    console.log(`[upload/classroom] Inserted ${inserted} entries for rooms: ${rooms.join(', ')}`);
    res.json({ success: true, inserted, rooms });

  } catch (err) {
    console.error('[upload/classroom] error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/timetable/upload/lab ──────────────────────────────────────────
// Wipes only type='lab' entries, then inserts new ones
router.post('/upload/lab', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    // 1. Parse (async — must await)
    const entries = await parseLabExcel(req.file.buffer);
    if (entries.length === 0) {
      return res.status(400).json({ error: 'No valid lab timetable entries found.' });
    }

    // 2. Delete old lab entries only (classroom data untouched)
    const { error: delError } = await supabase
      .from('timetable_entries')
      .delete()
      .eq('type', 'lab');
    if (delError) {
      console.warn('[upload/lab] delete warning:', delError.message);
    }

    // 3. Insert in chunks
    const CHUNK = 500;
    let inserted = 0;
    for (let i = 0; i < entries.length; i += CHUNK) {
      const chunk = entries.slice(i, i + CHUNK).map(e => ({
        roomName:    e.roomName,
        dayOfWeek:   e.dayOfWeek,
        startTime:   e.startTime,
        endTime:     e.endTime,
        facultyName: e.label,
        source:      'excel',
        type:        'lab',
      }));
      const { error: insError } = await supabase.from('timetable_entries').insert(chunk);
      if (insError) throw insError;
      inserted += chunk.length;
    }

    const rooms = [...new Set(entries.map(e => e.roomName))];
    console.log(`[upload/lab] Inserted ${inserted} entries for labs: ${rooms.join(', ')}`);
    res.json({ success: true, inserted, rooms });

  } catch (err) {
    console.error('[upload/lab] error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── DELETE /api/timetable/:type ─────────────────────────────────────────────
router.delete('/:type', async (req, res) => {
  const { type } = req.params;
  if (!['classroom', 'lab', 'all'].includes(type)) {
    return res.status(400).json({ error: 'type must be classroom, lab, or all' });
  }
  try {
    let query = supabase.from('timetable_entries').delete();
    if (type !== 'all') query = query.eq('type', type);
    else query = query.neq('id', 0);
    const { error } = await query;
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
