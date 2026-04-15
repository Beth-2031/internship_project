import { getAcademicSafetyReports } from '../../api/client'
import { useFetch } from '../../hooks/useFetch'
import SafetyPage from '../../components/ui/SafetyPage'

export default function AcademicSafety() {
  const { data, loading } = useFetch(getAcademicSafetyReports)
  return <SafetyPage reports={data} loading={loading} title="Student Safety Reports" canResolve={false} />
}
