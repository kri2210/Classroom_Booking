const BASE = '/api';   // Vite proxy forwards /api → http://localhost:5000

/* ─── Bookings ──────────────────────────────────────────────────────────────── */
export async function fetchBookings() {
  const r = await fetch(`${BASE}/bookings`);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function createBooking(data) {
  const r = await fetch(`${BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function updateBooking(id, data) {
  const r = await fetch(`${BASE}/bookings/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function deleteBooking(id) {
  const r = await fetch(`${BASE}/bookings/${id}`, { method: 'DELETE' });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

/* ─── Timetable ─────────────────────────────────────────────────────────────── */
export async function fetchTimetable() {
  const r = await fetch(`${BASE}/timetable`);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function uploadClassroomExcel(file) {
  const form = new FormData();
  form.append('file', file);
  const r = await fetch(`${BASE}/timetable/upload/classroom`, { method: 'POST', body: form });
  const json = await r.json();
  if (!r.ok) throw new Error(json.error || 'Upload failed');
  return json;
}

export async function uploadLabExcel(file) {
  const form = new FormData();
  form.append('file', file);
  const r = await fetch(`${BASE}/timetable/upload/lab`, { method: 'POST', body: form });
  const json = await r.json();
  if (!r.ok) throw new Error(json.error || 'Upload failed');
  return json;
}

export async function clearTimetable(type = 'all') {
  const r = await fetch(`${BASE}/timetable/${type}`, { method: 'DELETE' });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

/* ─── Faculty ───────────────────────────────────────────────────────────────── */
export async function fetchFaculty() {
  const r = await fetch(`${BASE}/faculty`);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function createFaculty(data) {
  const r = await fetch(`${BASE}/faculty`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await r.json();
  if (!r.ok) throw new Error(json.error || 'Failed to create faculty');
  return json;
}

export async function loginFaculty(email, password) {
  const r = await fetch(`${BASE}/faculty/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const json = await r.json();
  if (!r.ok) throw new Error(json.error || 'Invalid credentials');
  return json;
}
