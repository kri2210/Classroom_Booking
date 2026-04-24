import { useState } from 'react';
import { deleteBooking, uploadClassroomExcel, uploadLabExcel, createFaculty, clearTimetable } from '../lib/api';

export default function AdminView({ user, bookings, facultyUsers, onRefresh, onRefreshFaculty, showToast }) {
  const [activeTab, setActiveTab] = useState('bookings');
  const [filterDate, setFilterDate] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Excel uploaders
  const [classroomFile, setClassroomFile] = useState(null);
  const [labFile, setLabFile] = useState(null);
  const [uploading, setUploading] = useState({ classroom: false, lab: false });
  const [clearing,  setClearing]  = useState({ classroom: false, lab: false });

  // Create faculty
  const [newFaculty, setNewFaculty] = useState({ name: '', email: '', password: '', role: 'faculty' });
  const [creatingFaculty, setCreatingFaculty] = useState(false);

  const filtered = filterDate ? bookings.filter(b => b.date === filterDate) : bookings;

  async function handleDelete(id) {
    try {
      await deleteBooking(id);
      showToast('Booking deleted.', 'warning');
      setConfirmDelete(null);
      onRefresh();
    } catch (err) {
      showToast('Delete failed: ' + err.message, 'error');
    }
  }

  async function handleUpload(type) {
    const file = type === 'classroom' ? classroomFile : labFile;
    if (!file) { showToast(`Select a file first`, 'warning'); return; }
    setUploading(u => ({ ...u, [type]: true }));
    try {
      const fn = type === 'classroom' ? uploadClassroomExcel : uploadLabExcel;
      const res = await fn(file);
      showToast(`Imported ${res.inserted} ${type} entries from ${res.rooms.length} room(s)!`, 'success');
      onRefresh();
    } catch (err) {
      showToast(`Upload error: ${err.message}`, 'error');
    }
    setUploading(u => ({ ...u, [type]: false }));
  }

  async function handleClear(type) {
    if (!confirm(`Clear all ${type} timetable data? Slots will reopen for faculty.`)) return;
    setClearing(c => ({ ...c, [type]: true }));
    try {
      await clearTimetable(type);
      showToast(`${type === 'classroom' ? 'Classroom' : 'Lab'} timetable cleared.`, 'success');
      onRefresh();
    } catch (err) {
      showToast(`Clear error: ${err.message}`, 'error');
    }
    setClearing(c => ({ ...c, [type]: false }));
  }

  async function handleCreateFaculty(e) {
    e.preventDefault();
    if (!newFaculty.name || !newFaculty.email || !newFaculty.password) {
      showToast('Fill in all fields', 'warning'); return;
    }
    setCreatingFaculty(true);
    try {
      await createFaculty(newFaculty);
      showToast(`Account created for ${newFaculty.name}`, 'success');
      setNewFaculty({ name: '', email: '', password: '', role: 'faculty' });
      onRefreshFaculty();
    } catch (err) {
      showToast('Failed: ' + err.message, 'error');
    }
    setCreatingFaculty(false);
  }

  const TABS = [
    { id: 'bookings', label: '📋 Faculty Bookings' },
    { id: 'faculty',  label: '👤 Faculty Accounts' },
  ];

  return (
    <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '3rem' }}>
      {/* Tabs */}
      <div className="tabs">
        {TABS.map(t => (
          <button key={t.id} className={`tab-btn${activeTab === t.id ? ' active' : ''}`}
            onClick={() => setActiveTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Bookings Tab ── */}
      {activeTab === 'bookings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Excel Upload Cards */}
          <div className="upload-grid">
            {/* Classroom Upload */}
            <div className="card">
              <div className="card-header">
                <div style={{ fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                  🏫 Upload Classroom Timetable
                </div>
                <div style={{ fontSize: '.78rem', opacity: .85, marginTop: '.25rem' }}>
                  FEST Classroom Occupancy.xlsx
                </div>
              </div>
              <div className="card-body">
                <p style={{ fontSize: '.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Uploads will automatically clear old classroom data and sync new slots to the faculty grid.
                </p>
                <div className="upload-row">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    className="file-input-styled"
                    onChange={e => setClassroomFile(e.target.files[0] || null)}
                  />
                  <button
                    className="btn btn-gradient btn-sm"
                    onClick={() => handleUpload('classroom')}
                    disabled={uploading.classroom || !classroomFile}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    {uploading.classroom ? '⏳ Uploading…' : '⬆ Upload & Sync'}
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleClear('classroom')}
                    disabled={clearing.classroom}
                    style={{ whiteSpace: 'nowrap' }}
                    title="Clear all classroom timetable data"
                  >
                    {clearing.classroom ? '⏳ Clearing…' : '🗑 Clear'}
                  </button>
                </div>
              </div>
            </div>

            {/* Lab Upload */}
            <div className="card">
              <div className="card-header">
                <div style={{ fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                  🔬 Upload Laboratory Timetable
                </div>
                <div style={{ fontSize: '.78rem', opacity: .85, marginTop: '.25rem' }}>
                  Laboratory Time Table.xlsx
                </div>
              </div>
              <div className="card-body">
                <p style={{ fontSize: '.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Lab upload only replaces lab data — classroom bookings remain untouched.
                </p>
                <div className="upload-row">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    className="file-input-styled"
                    onChange={e => setLabFile(e.target.files[0] || null)}
                  />
                  <button
                    className="btn btn-gradient btn-sm"
                    onClick={() => handleUpload('lab')}
                    disabled={uploading.lab || !labFile}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    {uploading.lab ? '⏳ Uploading…' : '⬆ Upload & Sync'}
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleClear('lab')}
                    disabled={clearing.lab}
                    style={{ whiteSpace: 'nowrap' }}
                    title="Clear all lab timetable data"
                  >
                    {clearing.lab ? '⏳ Clearing…' : '🗑 Clear'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="card">
            <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '.75rem' }}>
              <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                All Bookings ({filtered.length})
              </div>
              <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="date"
                  value={filterDate}
                  onChange={e => setFilterDate(e.target.value)}
                  style={{ background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.3)', color: 'white', padding: '.4rem .75rem', borderRadius: '8px', fontSize: '.85rem', width: 'auto' }}
                />
                {filterDate && (
                  <button className="btn btn-ghost btn-sm" onClick={() => setFilterDate('')}>Clear filter</button>
                )}
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              {filtered.length === 0 ? (
                <div className="empty-state"><div className="empty-state-icon">📭</div><p className="empty-state-title">No bookings found</p></div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Room</th><th>Faculty</th><th>Date</th><th>Time</th><th>Status</th><th>Services</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(b => (
                      <tr key={b.id}>
                        <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{b.roomName}</td>
                        <td>{b.facultyName}</td>
                        <td>{b.date}</td>
                        <td style={{ fontFamily: 'monospace' }}>{b.startTime}–{b.endTime}</td>
                        <td>
                          <span className={b.status === 'confirmed' ? 'badge-confirmed' : 'badge-pending'}>
                            {b.status}
                          </span>
                        </td>
                        <td>
                          {b.itServices && <span title="IT Services" style={{ marginRight: '.25rem' }}>🖥</span>}
                          {b.foodServices && <span title="Food Services">🍽</span>}
                        </td>
                        <td>
                          {confirmDelete === b.id ? (
                            <div style={{ display: 'flex', gap: '.4rem' }}>
                              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(b.id)}>Delete</button>
                              <button className="btn btn-secondary btn-sm" onClick={() => setConfirmDelete(null)}>No</button>
                            </div>
                          ) : (
                            <button className="btn btn-secondary btn-sm" onClick={() => setConfirmDelete(b.id)}>Delete</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Faculty Accounts Tab ── */}
      {activeTab === 'faculty' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Create form */}
          <div className="card">
            <div className="card-header">
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>➕ Create Faculty Account</div>
            </div>
            <div className="card-body">
              <form onSubmit={handleCreateFaculty} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" placeholder="Dr. A. Sharma" value={newFaculty.name}
                    onChange={e => setNewFaculty(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" placeholder="a.sharma@college.edu" value={newFaculty.email}
                    onChange={e => setNewFaculty(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input type="password" placeholder="Choose a password" value={newFaculty.password}
                    onChange={e => setNewFaculty(f => ({ ...f, password: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select value={newFaculty.role} onChange={e => setNewFaculty(f => ({ ...f, role: e.target.value }))}>
                    <option value="faculty">Faculty</option>
                    <option value="hod">HOD</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button type="submit" className="btn btn-gradient" style={{ width: '100%' }} disabled={creatingFaculty}>
                    {creatingFaculty ? 'Creating…' : '✓ Create Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Faculty list */}
          <div className="card">
            <div className="card-header"><div style={{ fontWeight: 700 }}>Faculty Users ({facultyUsers.length})</div></div>
            <div style={{ overflowX: 'auto' }}>
              {facultyUsers.length === 0 ? (
                <div className="empty-state"><div className="empty-state-icon">👤</div><p className="empty-state-title">No faculty accounts yet</p></div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr><th>Name</th><th>Email</th><th>Role</th><th>Created</th></tr>
                  </thead>
                  <tbody>
                    {facultyUsers.map(f => (
                      <tr key={f.id}>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{f.name}</td>
                        <td>{f.email}</td>
                        <td><span className="badge-excel" style={{ textTransform: 'capitalize' }}>{f.role}</span></td>
                        <td>{f.created_at ? new Date(f.created_at).toLocaleDateString() : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
