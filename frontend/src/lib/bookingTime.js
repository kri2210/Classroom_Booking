export function parseBookingDateTime(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;

  const [year, month, day] = dateStr.split('-').map(Number);
  const [hour, minute] = timeStr.split(':').map(Number);

  if ([year, month, day, hour, minute].some(Number.isNaN)) return null;
  return new Date(year, month - 1, day, hour, minute);
}

export function isBookingCompleted(booking, now = new Date()) {
  const end = parseBookingDateTime(booking?.date, booking?.endTime);
  return Boolean(end && now >= end);
}

export function isSlotStartPast(dateStr, slotStart, now = new Date()) {
  const start = parseBookingDateTime(dateStr, slotStart);
  return Boolean(start && now >= start);
}
