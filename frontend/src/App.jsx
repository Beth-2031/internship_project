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
import WeeklyLogs from './pages/student/WeeklyLogs';
import SubmitLog from './pages/student/SubmitLog';
import SafetyReport from './pages/student/SafetyReport';
import CourseStatus from './pages/student/CourseStatus';

import SupervisorDashboard from './pages/supervisor/Dashboard';
import SupervisorPlacements from './pages/supervisor/Placements';
import SupervisorStudents from './pages/supervisor/Students';
import VerifyLogs from './pages/supervisor/VerifyLogs';
import SupervisorSafety from './pages/supervisor/Safety';
import LogDetail from './pages/supervisor/LogDetail';

import AcademicDashboard from './pages/academic/Dashboard';
import AcademicPlacements from './pages/academic/Placements';
import AcademicStudents from './pages/academic/Students';
import ApprovePlacements from './pages/academic/ApprovePlacements';
import CourseCompletions from './pages/academic/CourseCompletions';
import AcademicSafety from './pages/academic/safety';

import AdminDashboard from './pages/admin/Dashboard';
import AdminPlacements from './pages/admin/AllPlacements';
import ManageUsers from './pages/admin/ManageUsers';
import RegisterUser from './pages/admin/RegisterUser';
import AdminSafety from './pages/admin/Safety';
import ExportData from './pages/admin/ExportData';

function App() {
  return (
    <BrowserRouter>
      <Routes>
<<<<<<< HEAD
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
=======
        <Route path="/" element={<RegisterPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
>>>>>>> c7389cd7099998bcfdcebe8bc47a9b0dd8c077a5

        {/* Student routes */}
        <Route element={<ProtectedRoute allowedRoles={['student']}><StudentLayout /></ProtectedRoute>}>
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/placements" element={<StudentPlacements />} />
          <Route path="/student/my-placement" element={<StudentMyPlacement />} />
          <Route path="/student/logs" element={<WeeklyLogs />} />
          <Route path="/student/logs/new" element={<SubmitLog />} />
          <Route path="/student/safety" element={<SafetyReport />} />
          <Route path="/student/course" element={<CourseStatus />} />
        </Route>

        {/* Workplace Supervisor routes */}
        <Route element={<ProtectedRoute allowedRoles={['workplace_supervisor']}><SupervisorLayout /></ProtectedRoute>}>
          <Route path="/supervisor" element={<SupervisorDashboard />} />
          <Route path="/supervisor/dashboard" element={<SupervisorDashboard />} />
          <Route path="/supervisor/placements" element={<SupervisorPlacements />} />
          <Route path="/supervisor/students" element={<SupervisorStudents />} />
          <Route path="/supervisor/logs" element={<VerifyLogs />} />
          <Route path="/supervisor/logs/:id" element={<LogDetail />} />
          <Route path="/supervisor/safety" element={<SupervisorSafety />} />
        </Route>

        {/* Academic Supervisor routes */}
        <Route element={<ProtectedRoute allowedRoles={['academic_supervisor']}><AcademicLayout /></ProtectedRoute>}>
          <Route path="/academic" element={<AcademicDashboard />} />
          <Route path="/academic/dashboard" element={<AcademicDashboard />} />
          <Route path="/academic/placements" element={<AcademicPlacements />} />
          <Route path="/academic/students" element={<AcademicStudents />} />
          <Route path="/academic/placements/approve" element={<ApprovePlacements />} />
          <Route path="/academic/courses" element={<CourseCompletions />} />
          <Route path="/academic/safety" element={<AcademicSafety />} />
        </Route>

        {/* Admin routes */}
        <Route element={<ProtectedRoute allowedRoles={['internship_admin']}><AdminLayout /></ProtectedRoute>}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/placements" element={<AdminPlacements />} />
          <Route path="/admin/placements/pending" element={<AdminPlacements pendingOnly />} />
          <Route path="/admin/users" element={<ManageUsers />} />
          <Route path="/admin/users/new" element={<RegisterUser />} />
          <Route path="/admin/safety" element={<AdminSafety />} />
          <Route path="/admin/export" element={<ExportData />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;