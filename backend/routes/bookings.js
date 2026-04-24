const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

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
    const { error } = await supabase.from('bookings').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
