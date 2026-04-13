import AppLayout from '../components/layout/AppLayout'
import { useFetch } from '../hooks/useFetch'
import { getAllPlacements, getAllSafetyReports } from '../api/client'

export default function AdminLayout() {
  const { data: placements } = useFetch(getAllPlacements)
  const { data: safety }     = useFetch(getAllSafetyReports)
  return (
    <AppLayout
      badges={{
        pendingPlacements: placements?.filter(p => !p.is_approved).length ?? 0,
        openSafety:        safety?.filter(r => !r.is_resolved).length ?? 0,
      }}
      topbarTitle="Internship Management System"
      topbarSub="Admin Panel"
    />
  )
}
