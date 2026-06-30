const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

function parseBookingDateTime(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;

  const [year, month, day] = dateStr.split('-').map(Number);
  const [hour, minute] = timeStr.split(':').map(Number);

  if ([year, month, day, hour, minute].some(Number.isNaN)) return null;
  return new Date(year, month - 1, day, hour, minute);
}

function isBookingCompleted(booking) {
  const end = parseBookingDateTime(booking?.date, booking?.endTime);
  return Boolean(end && Date.now() >= end.getTime());
}

// GET /api/bookings
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('bookings').select('*');
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/bookings
router.post('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('bookings').insert(req.body).select();
    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/bookings/:id  — e.g. approve (set status=confirmed)
router.patch('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .update(req.body)
      .eq('id', req.params.id)
      .select();
    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/bookings/:id
router.delete('/:id', async (req, res) => {
  try {
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('id,date,endTime')
      .eq('id', req.params.id)
      .single();
    if (fetchError) throw fetchError;
    if (isBookingCompleted(booking)) {
      return res.status(409).json({ error: 'Completed bookings cannot be cancelled.' });
    }

    const { error } = await supabase.from('bookings').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
