// layouts/StudentLayout.jsx
import AppLayout from '../components/layout/AppLayout'
import { useFetch } from '../hooks/useFetch'
import { getWeeklyLogs } from '../api/client'
import ToastContainer from '../components/layout/toastContainer'

export function StudentLayout() {
  const { data: logs }   = useFetch(getWeeklyLogs)
  const pendingLogs = logs?.filter(l => !l.is_verified).length ?? 0
  return (
    <>
    <AppLayout
      badges={{ pendingLogs }}
      topbarTitle="Internship Logging and Evaluation System"
      topbarSub="Student Portal"
    />
    <ToastContainer />
    </>
  )
}
export default StudentLayout