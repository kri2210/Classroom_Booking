import { useState } from 'react';
import { deleteBooking } from '../lib/api';

export default function MyBookingsPage({ user, bookings, onRefresh, showToast, onBack }) {
  const [confirmCancel, setConfirmCancel] = useState(null);

  const myBookings = bookings.filter(b =>
    b.requestedBy?.toLowerCase() === user.email.toLowerCase()
  );

  async function handleCancelBooking(id) {
    try {
      await deleteBooking(id);
      showToast('Booking cancelled. Slot is now free.', 'warning');
      setConfirmCancel(null);
      onRefresh();
    } catch (err) {
      showToast('Cancel failed: ' + err.message, 'error');
    }
  }

  // Type icon helper
  function roomIcon(roomName = '') {
    const n = roomName.toLowerCase();
    if (n.includes('auditorium')) return '🎭';
    if (n.includes('lab')) return '🔬';
    return '🏫';
  }

  // Status color helper
  function statusStyle(status) {
    if (status === 'confirmed') return { background: '#d1fae5', color: '#065f46' };
    if (status === 'pending')   return { background: '#fef3c7', color: '#92400e' };
    return { background: '#1e293b', color: '#475569' };
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>

      {/* ── Page Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '1rem',
        marginBottom: '2rem', flexWrap: 'wrap',
      }}>
        <button className="btn btn-secondary" onClick={onBack}>
          ← Back
        </button>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
            📋 My Bookings
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '.875rem', marginTop: '.25rem' }}>
            {user.name || user.email} · {myBookings.length} booking{myBookings.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* ── Content ── */}
      {myBookings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <p className="empty-state-title">No bookings yet</p>
          <p>Book a room from the main view to see it here.</p>
          <button className="btn btn-gradient" style={{ marginTop: '1.5rem' }} onClick={onBack}>
            Book a Room
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
          {myBookings.map(b => (
            <div
              key={b.id}
              className="card animate-in"
              style={{ padding: 0, overflow: 'hidden' }}
            >
              {/* Card top strip (status color) */}
              <div style={{
                height: '5px',
                background: b.status === 'confirmed'
                  ? 'linear-gradient(90deg,#10b981,#059669)'
                  : 'linear-gradient(90deg,#f59e0b,#d97706)',
              }} />

              <div style={{ padding: '1.25rem' }}>
                {/* Room name + type */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.75rem' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                      {roomIcon(b.roomName)} {b.roomName}
                    </div>
                  </div>
                  <span style={{
                    ...statusStyle(b.status),
                    padding: '.25rem .85rem',
                    borderRadius: '999px',
                    fontSize: '.75rem',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    marginLeft: '.5rem',
                  }}>
                    {b.status === 'confirmed' ? '✓ Confirmed' : '⏳ Pending'}
                  </span>
                </div>

                {/* Details grid */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr',
                  gap: '.625rem', marginBottom: '1rem',
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-md)',
                  padding: '.875rem',
                }}>
                  <div>
                    <div style={{ fontSize: '.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: '.2rem' }}>Date</div>
                    <div style={{ fontSize: '.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>📅 {b.date}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: '.2rem' }}>Time</div>
                    <div style={{ fontSize: '.9rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>⏰ {b.startTime} – {b.endTime}</div>
                  </div>
                  <div style={{ gridColumn: '1/-1' }}>
                    <div style={{ fontSize: '.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: '.2rem' }}>Booked By</div>
                    <div style={{ fontSize: '.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>👤 {b.facultyName}</div>
                  </div>
                </div>

                {/* Services */}
                {(b.itServices || b.foodServices) && (
                  <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    {b.itServices && (
                      <span style={{ background: 'rgba(14,165,233,.15)', color: '#38bdf8', borderRadius: '999px', padding: '.2rem .75rem', fontSize: '.78rem', fontWeight: 600 }}>
                        🖥️ IT Services
                      </span>
                    )}
                    {b.foodServices && (
                      <span style={{ background: 'rgba(245,158,11,.15)', color: '#fbbf24', borderRadius: '999px', padding: '.2rem .75rem', fontSize: '.78rem', fontWeight: 600 }}>
                        🍽️ Food Services
                      </span>
                    )}
                  </div>
                )}

                {/* Cancel action */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '.5rem' }}>
                  {confirmCancel === b.id ? (
                    <>
                      <button className="btn btn-secondary btn-sm" onClick={() => setConfirmCancel(null)}>No, Keep</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleCancelBooking(b.id)}>Yes, Cancel</button>
                    </>
                  ) : (
                    <button className="btn btn-secondary btn-sm" onClick={() => setConfirmCancel(b.id)}>
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
