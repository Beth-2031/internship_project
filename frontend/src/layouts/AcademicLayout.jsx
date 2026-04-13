import AppLayout from '../components/layout/AppLayout'
import { useFetch } from '../hooks/useFetch'
import { getPendingPlacements, getAcademicSafetyReports } from '../api/client'

export default function AcademicLayout() {
  const { data: pending } = useFetch(getPendingPlacements)
  const { data: safety }  = useFetch(getAcademicSafetyReports)
  return (
    <AppLayout
      badges={{
        pendingPlacements: pending?.length ?? 0,
        openSafety:        safety?.filter(r => !r.is_resolved).length ?? 0,
      }}
      topbarTitle="Internship Management System"
      topbarSub="Academic Portal"
    />
  )
}
