import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import LoginPage from './loginPage';
import RegisterPage from './RegisterPage';
import ProtectedRoute from './ProtectedRoute';

// Dashboards
import StudentDashboard from './pages/student/Dashboard';
import SupervisorDashboard from './pages/supervisor/Dashboard';
import AcademicDashboard from './pages/academic/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';

// Optional fallback page
function NotFound() {
  return <h2>404 - Page Not Found</h2>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes */}

        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/supervisor/dashboard"
          element={
            <ProtectedRoute allowedRoles={['supervisor']}> {/* ⚠️ FIXED */}
              <SupervisorDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/academic/dashboard"
          element={
            <ProtectedRoute allowedRoles={['academic']}>
              <AcademicDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch all */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;