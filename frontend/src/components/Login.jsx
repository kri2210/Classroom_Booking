import { useState, useEffect } from 'react';
import { DEMO_USERS } from '../lib/constants';
import { loginFaculty } from '../lib/api';

// Adani University logo (same base64 as original)
const LOGO_B64 = 'data:image/png;base64,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';

export default function Login({ onLogin }) {
  // Pre-fill email from sessionStorage (persists across logout, but NOT password)
  const [email, setEmail] = useState(() => sessionStorage.getItem('lastEmail') || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Keep sessionStorage in sync whenever email changes
  useEffect(() => {
    if (email) sessionStorage.setItem('lastEmail', email);
  }, [email]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const em = email.trim().toLowerCase();
    const pw = password;

    // 1. Check demo users first
    const demo = DEMO_USERS[em];
    if (demo && demo.password === pw) {
      sessionStorage.setItem('lastEmail', em);
      onLogin({ email: em, role: demo.role, name: demo.name });
      setLoading(false);
      return;
    }

    // 2. Try backend faculty_users table
    try {
      const data = await loginFaculty(em, pw);
      sessionStorage.setItem('lastEmail', em);
      onLogin({ email: em, role: data.role || 'faculty', name: data.name || em });
    } catch {
      setError('Invalid email or password. Please try again.');
    }
    setLoading(false);
  }

  return (
    <div className="login-screen">
      <div className="login-blob-1" />
      <div className="login-blob-2" />

      <div className="login-card animate-in">
        <div className="login-logo-wrap">🏛️</div>
        <h1 className="login-title">Welcome Back</h1>
        <p className="login-subtitle">Adani University — Classroom Booking System</p>

        <div className="demo-accounts">
          <p className="demo-label">📋 Demo Accounts</p>
          {[
            ['Faculty', 'faculty@college.edu', 'faculty123'],
            ['HOD',     'hod@college.edu',     'hod123'],
            ['Admin',   'admin@college.edu',   'admin123'],
          ].map(([role, e, p]) => (
            <div
              key={role}
              className="demo-row"
              style={{ cursor: 'pointer' }}
              onClick={() => { setEmail(e); setPassword(p); }}
            >
              <span>{role}:</span> {e} / {p}
            </div>
          ))}
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && (
            <div className="error-msg">
              <span>✕</span>
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              placeholder="your.email@college.edu"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-gradient btn-lg" style={{ marginTop: '.5rem' }} disabled={loading}>
            {loading ? 'Signing in…' : 'Login to Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}
