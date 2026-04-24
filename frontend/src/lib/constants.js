// ─── Time Slots ──────────────────────────────────────────────────────────────
export const CLASSROOM_TIME_SLOTS = [
  { start: '09:10', end: '10:00' },
  { start: '10:00', end: '10:50' },
  { start: '11:00', end: '11:50' },
  { start: '11:50', end: '12:40' },
  { start: '12:40', end: '13:30' },
  { start: '13:30', end: '14:20' },
  { start: '14:20', end: '15:10' },
  { start: '15:30', end: '16:20' },
  { start: '16:20', end: '17:10' },
];

export const LAB_TIME_SLOTS = [
  { start: '09:10', end: '10:50' },
  { start: '11:00', end: '12:40' },
  { start: '12:40', end: '13:30' },
  { start: '13:30', end: '15:10' },
  { start: '15:30', end: '17:10' },
];

export const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// ─── Rooms ────────────────────────────────────────────────────────────────────
export const DEMO_ROOMS = [
  { id: '1',  name: 'CR4',          type: 'classroom',  needsApproval: false },
  { id: '2',  name: '201',          type: 'classroom',  needsApproval: false },
  { id: '3',  name: '202',          type: 'classroom',  needsApproval: false },
  { id: '4',  name: '203',          type: 'classroom',  needsApproval: false },
  { id: '5',  name: '301',          type: 'classroom',  needsApproval: false },
  { id: '6',  name: '302',          type: 'classroom',  needsApproval: false },
  { id: '7',  name: '303A',         type: 'classroom',  needsApproval: false },
  { id: '8',  name: '303B',         type: 'classroom',  needsApproval: false },
  { id: '9',  name: '304',          type: 'classroom',  needsApproval: false },
  { id: '10', name: '305',          type: 'classroom',  needsApproval: false },
  { id: '11', name: '306',          type: 'classroom',  needsApproval: false },
  { id: '12', name: '401',          type: 'classroom',  needsApproval: false },
  { id: '13', name: '402',          type: 'classroom',  needsApproval: false },
  { id: '14', name: '403',          type: 'classroom',  needsApproval: false },
  { id: '15', name: '404',          type: 'classroom',  needsApproval: false },
  { id: '16', name: '501',          type: 'classroom',  needsApproval: false },
  { id: '17', name: '502',          type: 'classroom',  needsApproval: false },
  { id: '18', name: '503',          type: 'classroom',  needsApproval: false },
  { id: '19', name: '504',          type: 'classroom',  needsApproval: false },
  { id: '20', name: 'Lab 2A',       type: 'lab',        needsApproval: false },
  { id: '21', name: 'Lab 2B',       type: 'lab',        needsApproval: false },
  { id: '22', name: 'Lab 2C',       type: 'lab',        needsApproval: false },
  { id: '23', name: 'Lab 3A',       type: 'lab',        needsApproval: false },
  { id: '24', name: 'Lab 3B',       type: 'lab',        needsApproval: false },
  { id: '25', name: 'Lab 3C',       type: 'lab',        needsApproval: false },
  { id: '26', name: 'Lab 4A',       type: 'lab',        needsApproval: false },
  { id: '27', name: 'Lab 4B',       type: 'lab',        needsApproval: false },
  { id: '28', name: 'Lab 4C',       type: 'lab',        needsApproval: false },
  { id: '29', name: 'Lab 5A',       type: 'lab',        needsApproval: false },
  { id: '30', name: 'Lab 5B',       type: 'lab',        needsApproval: false },
  { id: '31', name: 'Lab 5F-MP',    type: 'lab',        needsApproval: false },
  { id: '32', name: 'Lab 4F ADA',   type: 'lab',        needsApproval: false },
  { id: '33', name: 'Auditorium A', type: 'auditorium', needsApproval: true  },
  { id: '34', name: 'Auditorium B', type: 'auditorium', needsApproval: true  },
];

// ─── Demo Users (static fallback) ────────────────────────────────────────────
export const DEMO_USERS = {
  'faculty@college.edu': { password: 'faculty123', role: 'faculty', name: 'Faculty User' },
  'hod@college.edu':     { password: 'hod123',     role: 'hod',     name: 'HOD User'     },
  'admin@college.edu':   { password: 'admin123',   role: 'admin',   name: 'Admin User'   },
};
