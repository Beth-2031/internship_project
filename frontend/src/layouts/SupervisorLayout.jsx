import AppLayout from '../components/layout/AppLayout'
import { useFetch } from '../hooks/useFetch'
import { getPendingLogs, getSupervisorSafetyReports } from '../api/client'

export default function SupervisorLayout() {
  const { data: logs }   = useFetch(getPendingLogs)
  const { data: safety } = useFetch(getSupervisorSafetyReports)
  return (
    <AppLayout
      badges={{
        pendingLogs:  logs?.length ?? 0,
        openSafety:   safety?.filter(r => !r.is_resolved).length ?? 0,
      }}
      topbarTitle="Internship Management System"
      topbarSub="Supervisor Portal"
    />
  )
}
