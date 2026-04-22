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
>>>>>>> 0dd4b50f06a16c2d17639cce34f89964ed7958a3


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
        <Route path="/student" element={
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
          <ProtectedRoute allowedRoles={['workplace_supervisor']}>
            <SupervisorDashboard />
          </ProtectedRoute>
        } />
        <Route path="/supervisor" element={
          <ProtectedRoute allowedRoles={['workplace_supervisor']}>
            <SupervisorDashboard />
          </ProtectedRoute>
        } />
        <Route path="/supervisor/placements" element={
          <ProtectedRoute allowedRoles={['workplace_supervisor']}>
            <SupervisorPlacements />
          </ProtectedRoute>
        } />
        <Route path="/supervisor/students" element={
          <ProtectedRoute allowedRoles={['workplace_supervisor']}>
            <SupervisorPlacements />
          </ProtectedRoute>
        } />
        <Route path="/supervisor/students" element={
          <ProtectedRoute allowedRoles={['workplace']}>
            <SupervisorStudents />
          </ProtectedRoute>
        } />
        <Route path="/academic/dashboard" element={
          <ProtectedRoute allowedRoles={['academic_supervisor']}>
            <AcademicDashboard />
          </ProtectedRoute>
        } />
        <Route path="/academic" element={
          <ProtectedRoute allowedRoles={['academic_supervisor']}>
            <AcademicDashboard />
          </ProtectedRoute>
        } />
        <Route path="/academic/placements" element={
          <ProtectedRoute allowedRoles={['academic_supervisor']}>
            <AcademicPlacements />
          </ProtectedRoute>
        } />
        <Route path="/academic/students" element={
          <ProtectedRoute allowedRoles={['academic_supervisor']}>
            <AcademicPlacements />
          </ProtectedRoute>
        } />
        <Route path="/academic/students" element={
          <ProtectedRoute allowedRoles={['academic']}>
            <AcademicStudents />
          </ProtectedRoute>
        } />
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={['internship_admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
<<<<<<< HEAD
        <Route path="/admin/placements" element={
          <ProtectedRoute allowedRoles={['admin']}>
=======
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['internship_admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/placements" element={
          <ProtectedRoute allowedRoles={['internship_admin']}>
>>>>>>> 0dd4b50f06a16c2d17639cce34f89964ed7958a3
            <AdminPlacements />
          </ProtectedRoute>
        } />  
      </Routes>

    </BrowserRouter>
  );
}
export default App;
