import { CLASSROOM_TIME_SLOTS, LAB_TIME_SLOTS, DAYS_OF_WEEK } from '../lib/constants';

function getDayOfWeek(dateStr) {
  return DAYS_OF_WEEK[new Date(dateStr).getUTCDay()];
}

function isSlotPast(dateStr, slotStart) {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  if (dateStr < today) return true;
  if (dateStr > today) return false;
  const [sh, sm] = slotStart.split(':').map(Number);
  return now.getHours() * 60 + now.getMinutes() >= sh * 60 + sm;
}

function getSlotStatus(room, slot, selectedDate, bookings, timetableEntries) {
  if (!selectedDate) return { status: 'loading', label: 'Loading…' };

  // 1. Past
  if (isSlotPast(selectedDate, slot.start))
    return { status: 'expired', label: 'Time Passed' };

  const dayOfWeek = getDayOfWeek(selectedDate);

  // 2. Timetable block — overlap matching so lab's 50-min Excel rows
  //    correctly block 100-min lab booking slots.
  //    A timetable entry blocks this slot if its startTime falls within [slot.start, slot.end)
  const tt = timetableEntries.find(te => {
    if (te.roomName !== room.name || te.dayOfWeek !== dayOfWeek) return false;
    // Exact match (classrooms) OR entry starts within this slot's window (labs)
    const entryStart = te.startTime;
    const entryEnd   = te.endTime;
    const slotStart  = slot.start;
    const slotEnd    = slot.end;
    // Overlap: entry starts before slot ends AND entry ends after slot starts
    return entryStart < slotEnd && entryEnd > slotStart;
  });
  if (tt) return { status: 'fixed', label: `Scheduled: ${tt.facultyName || 'Class'}` };

  // 3. Faculty booking
  const bk = bookings.find(b =>
    b.roomName === room.name &&
    b.date === selectedDate &&
    b.startTime === slot.start &&
    b.endTime === slot.end
  );
  if (bk) {
    if (bk.status === 'confirmed') return { status: 'booked',  label: `Booked: ${bk.facultyName}` };
    if (bk.status === 'pending')   return { status: 'pending', label: 'Pending Approval' };
  }

  return { status: 'available', label: 'Available' };
}

const STATUS_CLASS = {
  available: 'slot-btn slot-available',
  fixed:     'slot-btn slot-fixed',
  booked:    'slot-btn slot-booked',
  pending:   'slot-btn slot-pending',
  expired:   'slot-btn slot-expired',
  loading:   'slot-btn slot-expired',
};

export default function SlotGrid({ rooms, bookings, timetableEntries, selectedDate, onBookSlot }) {
  if (rooms.length === 0) {
    return (
      <div className="empty-state" style={{ gridColumn: '1/-1' }}>
        <div className="empty-state-icon">🔍</div>
        <p className="empty-state-title">No rooms match your filters</p>
        <p>Try adjusting your search criteria</p>
      </div>
    );
  }

  return (
    <div className="room-grid">
      {rooms.map(room => {
        const slots = room.type === 'lab' ? LAB_TIME_SLOTS : CLASSROOM_TIME_SLOTS;
        return (
          <div key={room.id} className="room-card animate-in">
            <div className="room-card-header">
              <div>
                <div className="room-name">{room.name}</div>
                <div className="room-type">{room.type}</div>
              </div>
              {room.needsApproval && (
                <span className="badge-approval">Needs Approval</span>
              )}
            </div>

            <div className="room-card-slots">
              {slots.map(slot => {
                const { status, label } = getSlotStatus(room, slot, selectedDate, bookings, timetableEntries);
                const isAvail = status === 'available';
                return (
                  <button
                    key={`${slot.start}-${slot.end}`}
                    className={STATUS_CLASS[status] || STATUS_CLASS.loading}
                    disabled={!isAvail}
                    onClick={isAvail ? () => onBookSlot(room, slot) : undefined}
                    title={label}
                  >
                    <span className="slot-time">{slot.start} – {slot.end}</span>
                    <span className="slot-label">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
