// ── Spinner ──────────────────────────────────
export function Spinner({ size = 20 }) {
  return (
    <div className="spinner" style={{ width: size, height: size }} />
  )
}

// ── Loading screen ────────────────────────────
export function LoadingScreen({ text = 'Loading...' }) {
  return (
    <div className="loading-screen">
      <Spinner /> <span>{text}</span>
    </div>
  )
}

// ── Badge ─────────────────────────────────────
export function Badge({ children, variant = 'gray' }) {
  return <span className={`badge badge-${variant}`}>{children}</span>
}

// ── Alert ─────────────────────────────────────
export function Alert({ children, variant = 'amber' }) {
  const icons = {
    red: <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>,
    amber: <><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
    green: <><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>,
  }
  return (
    <div className={`alert alert-${variant}`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        {icons[variant] || icons.amber}
      </svg>
      <div>{children}</div>
    </div>
  )
}

// ── Stat Card ─────────────────────────────────
export function StatCard({ label, value, sub, color = '' }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className={`stat-value ${color}`}>{value ?? '—'}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  )
}

// ── Progress bar ──────────────────────────────
export function Progress({ value, max = 100, color = 'fill-blue' }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div className="progress-track">
      <div className={`progress-fill ${color}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

// ── Card ──────────────────────────────────────
export function Card({ title, subtitle, action, children, style }) {
  return (
    <div className="card fade-up" style={style}>
      {(title || action) && (
        <div className="card-head">
          <div>
            {title    && <div className="card-title">{title}</div>}
            {subtitle && <div className="card-sub">{subtitle}</div>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  )
}

// ── Empty state ───────────────────────────────
export function Empty({ text = 'Nothing here yet' }) {
  return (
    <div className="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="4"/>
        <path d="M9 9h6M9 13h4"/>
      </svg>
      <p>{text}</p>
    </div>
  )
}

// ── Confirm button (with loading state) ───────
export function ActionButton({ onClick, children, variant = '', small, loading: busy }) {
  return (
    <button
      className={`btn ${variant} ${small ? 'btn-sm' : ''}`}
      onClick={onClick}
      disabled={busy}
    >
      {busy ? <Spinner size={13} /> : children}
    </button>
  )
}