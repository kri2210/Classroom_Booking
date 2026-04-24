import { useState, useEffect, useCallback } from 'react';
import Login from './components/Login';
import FacultyView from './components/FacultyView';
import AdminView from './components/AdminView';
import HODView from './components/HODView';
import MyBookingsPage from './components/MyBookingsPage';
import Toast from './components/Toast';
import { fetchBookings, fetchTimetable, fetchFaculty } from './lib/api';

let toastCounter = 0;

export default function App() {
  // ── Auth State ──────────────────────────────────────────────────────────────
  const [user, setUser] = useState(null);    // { email, role, name }

  // ── Page routing: null = main view, 'myBookings' = My Bookings page ─────────
  const [page, setPage] = useState(null);

  // ── Data State ──────────────────────────────────────────────────────────────
  const [bookings, setBookings] = useState([]);
  const [timetableEntries, setTimetableEntries] = useState([]);
  const [facultyUsers, setFacultyUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Toast State ─────────────────────────────────────────────────────────────
  const [toasts, setToasts] = useState([]);

  function showToast(message, type = 'info') {
    const id = ++toastCounter;
    setToasts(t => [...t, { id, message, type }]);
  }

  function removeToast(id) {
    setToasts(t => t.filter(x => x.id !== id));
  }

  // ── Data Fetching ────────────────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    try {
      const [bk, tt] = await Promise.all([fetchBookings(), fetchTimetable()]);
      setBookings(bk.map(b => ({
        ...b,
        requestedBy: b.requestedBy?.toString().trim().toLowerCase() || '',
      })));
      setTimetableEntries(tt);
    } catch (err) {
      console.error('Data fetch error:', err);
    }
  }, []);

  const loadFaculty = useCallback(async () => {
    try {
      const data = await fetchFaculty();
      setFacultyUsers(data);
    } catch (err) {
      console.error('Faculty fetch error:', err);
    }
  }, []);

  // ── Initial load ─────────────────────────────────────────────────────────────
  useEffect(() => {
    async function init() {
      try {
        const [bk, tt] = await Promise.all([fetchBookings(), fetchTimetable()]);
        setBookings(bk.map(b => ({ ...b, requestedBy: b.requestedBy?.toString().trim().toLowerCase() || '' })));
        setTimetableEntries(tt);
      } catch (err) {
        console.error('Init error:', err);
      }
      setLoading(false);
    }
    init();
  }, []);

  // ── Login Handler ─────────────────────────────────────────────────────────────
  async function handleLogin(userInfo) {
    setUser(userInfo);
    setPage(null);
    await loadAll();
    if (userInfo.role === 'admin') await loadFaculty();
  }

  // ── Logout ─────────────────────────────────────────────────────────────────
  function handleLogout() {
    setUser(null);
    setPage(null);
    setBookings([]);
    setFacultyUsers([]);
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="loader-screen">
        <div style={{ textAlign: 'center' }}>
          <div className="loader-spinner" style={{ margin: '0 auto 1.5rem' }} />
          <p style={{ color: 'white', fontSize: '1.5rem', fontWeight: 800 }}>Loading…</p>
          <p style={{ color: 'rgba(255,255,255,.75)', marginTop: '.5rem' }}>Connecting to booking service</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Login onLogin={handleLogin} />
        <Toast toasts={toasts} removeToast={removeToast} />
      </>
    );
  }

  const roleBadgeColor = { admin: '#f43f5e', hod: '#f59e0b', faculty: '#10b981' }[user.role] || '#0ea5e9';
  const roleName = { admin: 'Admin', hod: 'HOD', faculty: 'Faculty' }[user.role] || user.role;

  // My Bookings scoped to current user
  const myBookings = bookings.filter(b =>
    b.requestedBy?.toLowerCase() === user.email.toLowerCase()
  );

  const canSeeMyBookings = user.role === 'faculty' || user.role === 'hod';

  return (
    <>
      {/* ── Header ── */}
      <header className="app-header">
        <div className="app-header-inner">
          {/* Brand — clicking it goes back to main if on My Bookings page */}
          <div className="header-brand" style={{ cursor: page ? 'pointer' : 'default' }} onClick={() => setPage(null)}>
            <div>
              <div className="header-title">📅 Classroom Booking</div>
              <div className="header-subtitle">Adani University</div>
            </div>
          </div>

          <div className="header-right">
            <span style={{ color: 'rgba(255,255,255,.9)', fontSize: '.9rem' }}>
              👋 {user.name || user.email}
            </span>
            <span className="badge" style={{ background: roleBadgeColor }}>
              {roleName}
            </span>

            {/* My Bookings nav link — Faculty & HOD only */}
            {canSeeMyBookings && (
              <button
                className={`nav-mybookings${page === 'myBookings' ? ' active' : ''}`}
                onClick={() => setPage(p => p === 'myBookings' ? null : 'myBookings')}
              >
                📋 My Bookings
                {myBookings.length > 0 && (
                  <span style={{
                    background: 'rgba(255,255,255,.35)',
                    borderRadius: '999px',
                    fontSize: '.7rem',
                    fontWeight: 800,
                    padding: '.05rem .45rem',
                    minWidth: '1.3rem',
                    textAlign: 'center',
                  }}>{myBookings.length}</span>
                )}
              </button>
            )}

            <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
              ⎋ Logout
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main>
        {/* My Bookings full page (Faculty & HOD) */}
        {page === 'myBookings' && canSeeMyBookings && (
          <MyBookingsPage
            user={user}
            bookings={bookings}
            onRefresh={loadAll}
            showToast={showToast}
            onBack={() => setPage(null)}
          />
        )}

        {/* Faculty main view */}
        {page !== 'myBookings' && user.role === 'faculty' && (
          <FacultyView
            user={user}
            bookings={bookings}
            timetableEntries={timetableEntries}
            onRefresh={loadAll}
            showToast={showToast}
          />
        )}

        {/* HOD main view */}
        {page !== 'myBookings' && user.role === 'hod' && (
          <HODView
            user={user}
            bookings={bookings}
            timetableEntries={timetableEntries}
            onRefresh={loadAll}
            showToast={showToast}
          />
        )}

        {/* Admin main view */}
        {user.role === 'admin' && (
          <AdminView
            user={user}
            bookings={bookings}
            facultyUsers={facultyUsers}
            onRefresh={loadAll}
            onRefreshFaculty={loadFaculty}
            showToast={showToast}
          />
        )}
      </main>

      <Toast toasts={toasts} removeToast={removeToast} />
    </>
  );
}
