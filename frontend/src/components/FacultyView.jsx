import { useState, useEffect } from 'react';
import { DEMO_ROOMS } from '../lib/constants';
import SlotGrid from './SlotGrid';
import BookingModal from './BookingModal';
// My Bookings page is handled at App level via MyBookingsPage component

export default function FacultyView({ user, bookings, timetableEntries, onRefresh, showToast }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [roomFilter, setRoomFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedSlot, setSelectedSlot] = useState(null);  // { room, slot }
  const [facultyName, setFacultyName] = useState(user.name || '');

  // Auto-refresh slot grid every 60 s so expired slots lock in real-time
  useEffect(() => {
    const t = setInterval(onRefresh, 60000);
    return () => clearInterval(t);
  }, [onRefresh]);

  const visibleRooms = DEMO_ROOMS.filter(r => {
    if (typeFilter !== 'all' && r.type !== typeFilter) return false;
    if (roomFilter && !r.name.toLowerCase().includes(roomFilter.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '3rem' }}>
      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="filter-grid">
          <div className="form-group">
            <label className="filter-label">📅 Date</label>
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]} />
          </div>

          <div className="form-group">
            <label className="filter-label">🔍 Search Room</label>
            <input type="text" placeholder="e.g. Lab 2B, 201…" value={roomFilter}
              onChange={e => setRoomFilter(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="filter-label">🏛️ Room Type</label>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="all">All Types</option>
              <option value="classroom">Classrooms</option>
              <option value="lab">Labs</option>
              <option value="auditorium">Auditorium</option>
            </select>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem', fontSize: '.78rem' }}>
          {[
            ['#10b981', 'Available'],
            ['#0ea5e9', 'Class Scheduled'],
            ['#f43f5e', 'Booked'],
            ['#f59e0b', 'Pending Approval'],
            ['#475569', 'Time Passed'],
          ].map(([color, label]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '.4rem', color: 'var(--text-secondary)' }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, background: color, flexShrink: 0 }} />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Room Grid */}
      <SlotGrid
        rooms={visibleRooms}
        bookings={bookings}
        timetableEntries={timetableEntries}
        selectedDate={selectedDate}
        onBookSlot={(room, slot) => setSelectedSlot({ room, slot })}
      />

      {/* Booking Modal */}
      {selectedSlot && (
        <BookingModal
          room={selectedSlot.room}
          slot={selectedSlot.slot}
          selectedDate={selectedDate}
          facultyName={facultyName}
          userEmail={user.email}
          onFacultyNameChange={setFacultyName}
          onClose={() => setSelectedSlot(null)}
          onSuccess={() => { setSelectedSlot(null); onRefresh(); }}
          showToast={showToast}
        />
      )}
    </div>
  );
}
