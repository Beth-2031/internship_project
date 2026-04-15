import { getSupervisorSafetyReports } from '../../api/client'
import { useFetch } from '../../hooks/useFetch'
import SafetyPage from '../../components/ui/SafetyPage'

export default function SupervisorSafety() {
  const { data, loading } = useFetch(getSupervisorSafetyReports)
  return <SafetyPage reports={data} loading={loading} title="Student Safety Reports" canResolve={false} />
}
