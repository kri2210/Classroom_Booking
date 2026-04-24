require('dotenv').config();
const express = require('express');
const cors = require('cors');

const timetableRouter = require('./routes/timetable');
const bookingsRouter = require('./routes/bookings');
const facultyRouter = require('./routes/faculty');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json());

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/timetable', timetableRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/faculty', facultyRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n╔══════════════════════════════════════════╗`);
  console.log(`║  College Booking Backend — Port ${PORT}     ║`);
  console.log(`╚══════════════════════════════════════════╝\n`);
});
