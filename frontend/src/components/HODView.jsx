import { useState, useEffect } from 'react';
import { DEMO_ROOMS } from '../lib/constants';
import { updateBooking } from '../lib/api';
import SlotGrid from './SlotGrid';
import BookingModal from './BookingModal';

export default function HODView({ user, bookings, timetableEntries, onRefresh, showToast }) {
  const [activeTab, setActiveTab] = useState('approval');   // 'approval' | 'book'
  const [confirmAction, setConfirmAction] = useState(null); // booking id for deny confirm

  // ── Booking tab state ────────────────────────────────────────────────────────
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [typeFilter, setTypeFilter] = useState('all');      // HOD can book all room types
  const [roomFilter, setRoomFilter] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [facultyName, setFacultyName] = useState(user.name || '');

  // Auto-refresh every 60s
  useEffect(() => {
    const t = setInterval(onRefresh, 60000);
    return () => clearInterval(t);
  }, [onRefresh]);

  // ── Derived data ─────────────────────────────────────────────────────────────
  // Approval queue is AUDITORIUM-only — classrooms & labs are booked directly
  const isAuditorium = b => b.roomName?.toLowerCase().includes('auditorium');
  const pending  = bookings.filter(b => b.status === 'pending'   && isAuditorium(b));
  const approved = bookings.filter(b => b.status === 'confirmed' && isAuditorium(b));

  // All rooms — HOD can book classrooms, labs, and auditoriums
  const visibleRooms = DEMO_ROOMS.filter(r => {
    if (typeFilter !== 'all' && r.type !== typeFilter) return false;
    if (roomFilter && !r.name.toLowerCase().includes(roomFilter.toLowerCase())) return false;
    return true;
  });

  // ── Approval handlers ────────────────────────────────────────────────────────
  async function handleApprove(id) {
    try {
      await updateBooking(id, { status: 'confirmed' });
      showToast('Booking approved!', 'success');
      onRefresh();
    } catch (err) {
      showToast('Approve failed: ' + err.message, 'error');
    }
  }

  async function handleDeny(id) {
    try {
      await deleteBooking(id);
      showToast('Booking denied and removed.', 'warning');
      setConfirmAction(null);
      onRefresh();
    } catch (err) {
      showToast('Deny failed: ' + err.message, 'error');
    }
  }

  // ── Main HOD View ─────────────────────────────────────────────────────────────
  return (
    <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '3rem' }}>

      {/* Dual-tab bar */}
      <div className="hod-tab-bar">
        <button
          className={`hod-tab${activeTab === 'approval' ? ' active' : ''}`}
          onClick={() => setActiveTab('approval')}
        >
          ⏳ Approval Queue
          {pending.length > 0 && (
            <span style={{
              background: '#f43f5e', color: 'white',
              borderRadius: '999px', fontSize: '.7rem', fontWeight: 800,
              padding: '.1rem .5rem', minWidth: '1.4rem', textAlign: 'center'
            }}>{pending.length}</span>
          )}
        </button>
        <button
          className={`hod-tab${activeTab === 'book' ? ' active' : ''}`}
          onClick={() => setActiveTab('book')}
        >
          📅 Book Slot
        </button>
      </div>

      {/* ── APPROVAL TAB ──────────────────────────────────────────────────────── */}
      {activeTab === 'approval' && (
        <>
          {/* Pending Approvals */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header">
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>⏳ Auditorium — Pending Approvals ({pending.length})</div>
            </div>
            <div style={{ padding: '1rem' }}>
              {pending.length === 0 ? (
                <div className="empty-state" style={{ padding: '2rem' }}>
                  <div className="empty-state-icon" style={{ fontSize: '2rem' }}>✅</div>
                  <p className="empty-state-title">All clear — nothing pending</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.875rem' }}>
                  {pending.map(b => (
                    <div key={b.id} className="booking-card">
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>{b.roomName}</div>
                        <div className="booking-meta">
                          <div className="booking-meta-item">👤 {b.facultyName}</div>
                          <div className="booking-meta-item">📅 {b.date}</div>
                          <div className="booking-meta-item">⏰ {b.startTime} – {b.endTime}</div>
                          {b.itServices && <div className="booking-meta-item">🖥 IT Req.</div>}
                          {b.foodServices && <div className="booking-meta-item">🍽 Food Req.</div>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <button className="btn btn-success btn-sm" onClick={() => handleApprove(b.id)}>✓ Approve</button>
                        {confirmAction === b.id ? (
                          <>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDeny(b.id)}>Yes, Deny</button>
                            <button className="btn btn-secondary btn-sm" onClick={() => setConfirmAction(null)}>Cancel</button>
                          </>
                        ) : (
                          <button className="btn btn-danger btn-sm" onClick={() => setConfirmAction(b.id)}>✕ Deny</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* All Confirmed Bookings */}
          <div className="card">
            <div className="card-header">
              <div style={{ fontWeight: 700 }}>🎭 Auditorium — Confirmed Bookings ({approved.length})</div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              {approved.length === 0 ? (
                <div className="empty-state" style={{ padding: '2rem' }}>
                  <p style={{ color: 'var(--text-muted)' }}>No confirmed bookings</p>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr><th>Room</th><th>Faculty</th><th>Date</th><th>Time</th><th>Services</th></tr>
                  </thead>
                  <tbody>
                    {approved.map(b => (
                      <tr key={b.id}>
                        <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{b.roomName}</td>
                        <td>{b.facultyName}</td>
                        <td>{b.date}</td>
                        <td style={{ fontFamily: 'monospace' }}>{b.startTime}–{b.endTime}</td>
                        <td>
                          {b.itServices && '🖥 '}
                          {b.foodServices && '🍽'}
                          {!b.itServices && !b.foodServices && '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── BOOK SLOT TAB ─────────────────────────────────────────────────────── */}
      {activeTab === 'book' && (
        <>
          {/* Filter bar */}
          <div className="filter-bar">
            <div className="filter-grid">
              <div className="form-group">
                <label className="filter-label">📅 Date</label>
                <input type="date" value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="form-group">
                <label className="filter-label">🔍 Search Room</label>
                <input type="text" placeholder="e.g. Auditorium A…" value={roomFilter}
                  onChange={e => setRoomFilter(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="filter-label">🏛️ Room Type</label>
                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                  <option value="all">All Types</option>
                  <option value="auditorium">Auditorium</option>
                  <option value="classroom">Classrooms</option>
                  <option value="lab">Labs</option>
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
            timetableEntries={timetableEntries || []}
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
        </>
      )}
    </div>
  );
}
