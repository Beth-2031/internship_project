import { useState } from 'react'
import { exportData } from '../../api/client'
import { Card, Alert } from '../../components/ui'

const EXPORTS = [
  {
    type:    'placements',
    title:   'Internship Placements',
    desc:    'All placement records — student, company, department, dates, approval status',
    icon:    'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z',
    color:   'icon-blue',
  },
  {
    type:    'logs',
    title:   'Weekly Logs',
    desc:    'All weekly log entries — student, week number, hours, verification status',
    icon:    'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z',
    color:   'icon-green',
  },
  {
    type:    'safety',
    title:   'Safety Reports',
    desc:    'All safety reports — student, description, date, resolution status',
    icon:    'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z',
    color:   'icon-red',
  },
  {
    type:    'users',
    title:   'Users',
    desc:    'All registered users — name, username, email, role',
    icon:    'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M12 7a4 4 0 100 8 4 4 0 000-8z',
    color:   'icon-amber',
  },
  {
    type:    'courses',
    title:   'Course Completions',
    desc:    'Hour completion records — student, course, approved hours, completion status',
    icon:    'M9 11l3 3L22 4',
    color:   'icon-purple',
  },
]

export default function ExportData() {
  const [loading, setLoading] = useState(null)
  const [success, setSuccess] = useState('')
  const [error,   setError]   = useState('')

  const handleExport = async type => {
    setLoading(type); setError(''); setSuccess('')
    try {
      const res  = await exportData(type)
      const url  = URL.createObjectURL(new Blob([res.data]))
      const a    = document.createElement('a')
      a.href     = url
      a.download = `${type}_export.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setSuccess(`${type}.csv downloaded successfully`)
    } catch {
      setError('Export failed. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="fade-up" style={{ maxWidth: 700 }}>
      <div className="page-header">
        <h1>Export Data</h1>
        <p>Download system data as CSV files</p>
      </div>

      {success && <Alert variant="green">{success}</Alert>}
      {error   && <Alert variant="red">{error}</Alert>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {EXPORTS.map(ex => (
          <Card key={ex.type}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div className={`item-icon ${ex.color}`} style={{ width: 42, height: 42, flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={ex.icon}/>
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, fontFamily: 'var(--font-head)' }}>{ex.title}</div>
                <div style={{ color: 'var(--text3)', fontSize: 12, marginTop: 2 }}>{ex.desc}</div>
              </div>
              <button
                className="btn btn-sm"
                onClick={() => handleExport(ex.type)}
                disabled={!!loading}
                style={{ flexShrink: 0 }}
              >
                {loading === ex.type ? (
                  <><span style={{ width: 12, height: 12, border: '2px solid var(--border2)', borderTopColor: 'var(--accent)', borderRadius: '50%', display: 'inline-block', animation: 'spin .6s linear infinite' }} /> Exporting…</>
                ) : (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                    </svg>
                    Download CSV
                  </>
                )}
              </button>
            </div>
          </Card>
        ))}
      </div>

      <div style={{ marginTop: 24, padding: 16, background: 'var(--surface2)', borderRadius: 'var(--radius-lg)', fontSize: 12, color: 'var(--text3)', lineHeight: 1.7 }}>
        <strong style={{ color: 'var(--text2)' }}>Note:</strong> Exports include all records in the system. Files are downloaded as UTF-8 encoded CSV, compatible with Excel, Google Sheets, and most data tools.
      </div>
    </div>
  )
}
