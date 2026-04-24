const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// GET /api/faculty
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('faculty_users')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/faculty — create faculty account
router.post('/', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email, and password are required' });
    }
    const { data, error } = await supabase
      .from('faculty_users')
      .insert({ name, email: email.toLowerCase(), password, role: role || 'faculty' })
      .select();
    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/faculty/login — verify credentials
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { data, error } = await supabase
      .from('faculty_users')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('password', password)
      .single();
    if (error || !data) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
