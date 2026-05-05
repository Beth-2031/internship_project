import { getAllSafetyReports, resolveReport } from '../../api/client'
import { useFetch } from '../../hooks/useFetch'
import SafetyPage from '../../components/ui/SafetyPage'

export default function AdminSafety() {
  const { data, loading, refetch } = useFetch(getAllSafetyReports)

  const handleResolve = async id => {
    await resolveReport(id)
    refetch()
  }

  return <SafetyPage reports={data} loading={loading} title="All Safety Reports" canResolve onResolve={handleResolve} />
}
