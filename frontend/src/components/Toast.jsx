import { useEffect, useRef } from 'react';

const COLORS = {
  success: '#10b981',
  error:   '#f43f5e',
  warning: '#f59e0b',
  info:    '#0ea5e9',
};

const ICONS = {
  success: '✓',
  error:   '✕',
  warning: '⚠',
  info:    'ℹ',
};

export default function Toast({ toasts, removeToast }) {
  return (
    <div id="toast-root">
      {toasts.map(t => <ToastItem key={t.id} toast={t} onRemove={() => removeToast(t.id)} />)}
    </div>
  );
}

function ToastItem({ toast, onRemove }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    requestAnimationFrame(() => { el.style.opacity = '1'; el.style.transform = 'translateX(0)'; });
    const timer = setTimeout(onRemove, 3800);
    return () => clearTimeout(timer);
  }, []);

  const color = COLORS[toast.type] || COLORS.info;

  return (
    <div
      ref={ref}
      onClick={onRemove}
      style={{
        background: color,
        color: 'white',
        padding: '.75rem 1.125rem',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0,0,0,.5)',
        display: 'flex',
        alignItems: 'center',
        gap: '.625rem',
        fontWeight: 600,
        fontSize: '.875rem',
        cursor: 'pointer',
        opacity: 0,
        transform: 'translateX(40px)',
        transition: 'opacity .3s ease, transform .3s ease',
        maxWidth: '360px',
      }}
    >
      <span style={{ fontSize: '1.1rem' }}>{ICONS[toast.type]}</span>
      <span>{toast.message}</span>
    </div>
  );
}
