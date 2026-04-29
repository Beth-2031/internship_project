// layouts/StudentLayout.jsx
import AppLayout from '../components/layout/AppLayout'
import { useFetch } from '../hooks/useFetch'
import { getSafetyReports, getWeeklyLogs } from '../api/client'
import ToastContainer from '../components/ToastContainer'

export function StudentLayout() {
  const { data: logs }   = useFetch(getWeeklyLogs)
  const { data: safety } = useFetch(getSafetyReports)
  const pendingLogs = logs?.filter(l => !l.is_verified).length ?? 0
  return (
    <>
    <AppLayout
      badges={{ pendingLogs }}
      topbarTitle="Internship Management System"
      topbarSub="Student Portal"
    />
    <ToastContainer />
    </>
  )
}
export default StudentLayout