import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './loginPage';
import RegisterPage from './RegisterPage';
import ProtectedRoute from './ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <h1>Welcome to Dashboard</h1>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}
export default App;