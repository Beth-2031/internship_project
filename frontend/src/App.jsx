import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './loginPage';
import RegisterPage from './RegisterPage';
import './STYLES/App.css'
import ProtectedRoute from './ProtectedRoute';

import StudentLayout from './layouts/StudentLayout';
import SupervisorLayout from './layouts/SupervisorLayout';
import AcademicLayout from './layouts/AcademicLayout';
import AdminLayout from './layouts/AdminLayout';

import StudentDashboard from './pages/student/Dashboard';
import StudentPlacements from './pages/student/Placements';
import StudentMyPlacement from './pages/student/MyPlacement';

import SupervisorDashboard from './pages/supervisor/Dashboard';
import SupervisorPlacements from './pages/supervisor/Placements';
import SupervisorStudents from './pages/supervisor/Students';

import AcademicDashboard from './pages/academic/Dashboard';
import AcademicPlacements from './pages/academic/Placements';
import AcademicStudents from './pages/academic/Students';

import AdminDashboard from './pages/admin/Dashboard';
import AdminPlacements from './pages/admin/AllPlacements';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Student routes */}
        <Route element={<ProtectedRoute allowedRoles={['student']}><StudentLayout /></ProtectedRoute>}>
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/placements" element={<StudentPlacements />} />
          <Route path="/student/my-placement" element={<StudentMyPlacement />} />
        </Route>

        {/* Workplace Supervisor routes */}
        <Route element={<ProtectedRoute allowedRoles={['workplace_supervisor']}><SupervisorLayout /></ProtectedRoute>}>
          <Route path="/supervisor" element={<SupervisorDashboard />} />
          <Route path="/supervisor/dashboard" element={<SupervisorDashboard />} />
          <Route path="/supervisor/placements" element={<SupervisorPlacements />} />
          <Route path="/supervisor/students" element={<SupervisorStudents />} />
        </Route>

        {/* Academic Supervisor routes */}
        <Route element={<ProtectedRoute allowedRoles={['academic_supervisor']}><AcademicLayout /></ProtectedRoute>}>
          <Route path="/academic" element={<AcademicDashboard />} />
          <Route path="/academic/dashboard" element={<AcademicDashboard />} />
          <Route path="/academic/placements" element={<AcademicPlacements />} />
          <Route path="/academic/students" element={<AcademicStudents />} />
        </Route>

        {/* Admin routes */}
        <Route element={<ProtectedRoute allowedRoles={['internship_admin']}><AdminLayout /></ProtectedRoute>}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/placements" element={<AdminPlacements />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;