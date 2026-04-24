import { useState } from 'react';
import { createBooking } from '../lib/api';

export default function BookingModal({ room, slot, selectedDate, facultyName, userEmail, onFacultyNameChange, onClose, onSuccess, showToast }) {
  const [itServices, setItServices] = useState(false);
  const [foodServices, setFoodServices] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleConfirm() {
    if (!facultyName.trim()) { showToast('Please enter your full name', 'warning'); return; }
    setSubmitting(true);
    try {
      await createBooking({
        roomName:    room.name,
        facultyName: facultyName.trim(),
        date:        selectedDate,
        startTime:   slot.start,
        endTime:     slot.end,
        status:      room.needsApproval ? 'pending' : 'confirmed',
        requestedBy: (userEmail || '').toLowerCase(),
        itServices,
        foodServices,
      });
      showToast(
        room.needsApproval ? `Request submitted for ${room.name}!` : `${room.name} booked successfully!`,
        'success'
      );
      onSuccess();
    } catch (err) {
      showToast('Booking failed: ' + err.message, 'error');
    }
    setSubmitting(false);
  }

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <div className="modal-header">
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>📅 Book Room</div>
            <div style={{ fontSize: '.85rem', opacity: .85 }}>Confirm your reservation</div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Booking details */}
          <div className="booking-info">
            <div>
              <div className="info-label">Room</div>
              <div className="info-value">{room.name}</div>
            </div>
            <div>
              <div className="info-label">Type</div>
              <div className="info-value" style={{ textTransform: 'capitalize' }}>{room.type}</div>
            </div>
            <div>
              <div className="info-label">Date</div>
              <div className="info-value">{selectedDate}</div>
            </div>
            <div>
              <div className="info-label">Time</div>
              <div className="info-value">{slot.start} – {slot.end}</div>
            </div>
          </div>

          {/* HOD approval warning */}
          {room.needsApproval && (
            <div className="approval-warning">
              ⚠️ <strong>This room requires HOD approval.</strong> Your booking will be pending until approved. You'll be notified of the decision.
            </div>
          )}

          {/* Faculty name */}
          <div className="form-group">
            <label htmlFor="faculty-name">Your Full Name</label>
            <input
              id="faculty-name"
              type="text"
              placeholder="e.g. Dr. A. Sharma"
              value={facultyName}
              onChange={e => onFacultyNameChange(e.target.value)}
              autoFocus
            />
          </div>

          {/* Services */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
            <div className="checkbox-row">
              <input type="checkbox" id="it-services" checked={itServices} onChange={e => setItServices(e.target.checked)} />
              <label htmlFor="it-services">🖥️ IT Services Required</label>
            </div>
            <div className="checkbox-row">
              <input type="checkbox" id="food-services" checked={foodServices} onChange={e => setFoodServices(e.target.checked)} />
              <label htmlFor="food-services">🍽️ Food Services Required</label>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={onClose} disabled={submitting}>Cancel</button>
            <button className="btn btn-gradient" onClick={handleConfirm} disabled={submitting}>
              {submitting ? 'Booking…' : room.needsApproval ? 'Submit Request' : 'Confirm Booking'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
