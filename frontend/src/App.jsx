import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './loginPage';
import RegisterPage from './RegisterPage';
import './STYLES/App.css'
import ProtectedRoute from './ProtectedRoute';
<<<<<<< HEAD
import StudentDashboard     from './pages/student/Dashboard';
import StudentPlacements    from './pages/student/Placements';
import StudentMyPlacement   from './pages/student/MyPlacement';
import SupervisorDashboard  from './pages/supervisor/Dashboard';
import SupervisorPlacements from './pages/supervisor/Placements';
import SupervisorStudents   from './pages/supervisor/Students';
import AcademicDashboard    from './pages/academic/Dashboard';
import AcademicPlacements   from './pages/academic/Placements';
import AcademicStudents     from './pages/academic/Students';
import AdminDashboard       from './pages/admin/Dashboard';
import AdminPlacements       from './pages/admin/AllPlacements';
=======
import StudentDashboard from './pages/student/Dashboard';
import StudentPlacements from './pages/student/MyPlacement';
import SupervisorDashboard from './pages/supervisor/Dashboard';
import SupervisorPlacements from './pages/supervisor/Students';
import AcademicDashboard from './pages/academic/Dashboard';
import AcademicPlacements from './pages/academic/Students';
import AdminDashboard from './pages/admin/Dashboard';
import AdminPlacements from './pages/admin/AllPlacements';
>>>>>>> 71a0c62228a9d8918103b3f13de553f883dc136d


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/student/dashboard" element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentDashboard />
          </ProtectedRoute>
        } />
        <Route path="/student/placements" element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentPlacements />
          </ProtectedRoute>
        } />
        <Route path="/student/my-placement" element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentMyPlacement />
          </ProtectedRoute>
        } />
         <Route path="/supervisor/dashboard" element={
          <ProtectedRoute allowedRoles={['workplace']}>
            <SupervisorDashboard />
          </ProtectedRoute>
        } />
        <Route path="/supervisor/placements" element={
          <ProtectedRoute allowedRoles={['workplace']}>
            <SupervisorPlacements />
          </ProtectedRoute>
        } />
        <Route path="/supervisor/students" element={
          <ProtectedRoute allowedRoles={['workplace']}>
            <SupervisorStudents />
          </ProtectedRoute>
        } />
        <Route path="/academic/dashboard" element={
          <ProtectedRoute allowedRoles={['academic']}>
            <AcademicDashboard />
          </ProtectedRoute>
        } />
        <Route path="/academic/placements" element={
          <ProtectedRoute allowedRoles={['academic']}>
            <AcademicPlacements />
          </ProtectedRoute>
        } />
        <Route path="/academic/students" element={
          <ProtectedRoute allowedRoles={['academic']}>
            <AcademicStudents />
          </ProtectedRoute>
        } />
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/placements" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminPlacements />
          </ProtectedRoute>
        } />  
      </Routes>

    </BrowserRouter>
  );
}
export default App;
