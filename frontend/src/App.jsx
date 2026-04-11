import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './loginPage';
import RegisterPage from './RegisterPage';
import ProtectedRoute from './ProtectedRoute';
import StudentDashboard     from './pages/student/Dashboard';
import StudentPlacements    from './pages/student/Placements';
import SupervisorDashboard  from './pages/supervisor/Dashboard';
import SupervisorPlacements from './pages/supervisor/Placements';
import AcademicDashboard    from './pages/academic/Dashboard';
import AcademicPlacements   from './pages/academic/Placements';
import AdminDashboard       from './pages/admin/Dashboard';
import AdminPlacements      from './pages/admin/Placements';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
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
