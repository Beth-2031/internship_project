import { Badge } from './index.jsx'
import { Link } from 'react-router-dom'

// Shared placement row component
export function PlacementRow({ placement, actions = null }) {
  const statusVariant = placement.is_approved ? 'green' : 'amber'
  const statusText = placement.is_approved ? 'Approved' : 'Pending Approval'

  return (
    <div className="item-row">
      <div className="item-main">
        <div style={{ fontFamily: 'var(--font-head)', fontSize: 15, fontWeight: 600 }}>
          {placement.company_name || 'Unnamed Company'}
        </div>
        <div style={{ color: 'var(--text3)', fontSize: 13, marginTop: 2 }}>
          {placement.department || '—'} · {placement.location || '—'}
        </div>
      </div>
      <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--text3)' }}>
        <div>{placement.start_date || '—'} → {placement.end_date || '—'}</div>
        <Badge variant={statusVariant}>{statusText}</Badge>
        {actions}
      </div>
    </div>
  )
}

// Shared placements table/list component
export default function Placements({ data, loading, emptyText = 'No placements found', actionsRenderer, headerActions }) {
  return (
    <div>
      {headerActions && headerActions()}
      {loading ? (
        <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <span className="spinner" style={{ width: 32, height: 32, display: 'inline-block', marginBottom: 12 }} />
          <div>Loading placements...</div>
        </div>
      ) : data?.length > 0 ? (
        <div className="fade-up">
          {data.map(placement => (
            <PlacementRow key={placement.id} placement={placement} actions={actionsRenderer?.(placement)} />
          ))}
        </div>
      ) : (
        <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text3)' }}>
          {emptyText}
        </div>
      )}
    </div>
  )
}

