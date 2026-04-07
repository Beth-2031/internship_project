import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './loginPage';
import RegisterPage from './RegisterPage';
import ProtectedRoute from './ProtectedRoute';
import StudentDashboard     from './pages/student/StudentDashboard';
import SupervisorDashboard  from './pages/supervisor/SupervisorDashboard';
import AcademicDashboard    from './pages/academic/AcademicDashboard';
import AdminDashboard       from './pages/admin/AdminDashboard';


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
         <Route path="/supervisor/dashboard" element={
          <ProtectedRoute allowedRoles={['workplace']}>
            <SupervisorDashboard />
          </ProtectedRoute>
        } />
        <Route path="/academic/dashboard" element={
          <ProtectedRoute allowedRoles={['academic']}>
            <AcademicDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
      </Routes>

    </BrowserRouter>
  );
}
export default App;