import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './STYLES/loginPage.css';
import { register as apiRegister } from './api/client'
import { useNotification } from './components/layout/Notification'

const roles = [
    {label: 'Student Intern', value: 'student' },
    {label: 'Internship Administrator', value: 'internship_admin' },
];

export default function RegisterPage() {
    const [selectedRole, setSelectedRole] = useState('student');
    const [fullName, setFullName] = useState('');
    const [studentNumber, setStudentNumber] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [course, setCourse] = useState('');
    const [department, setDepartment] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate()
    const {addNotification} = useNotification();
    const testUpload = async () => {
      addNotification('Testing upload...', 'success');
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
          await apiRegister({
            email,
            password,
            role: selectedRole,
            full_name: fullName,
            student_number: studentNumber,
            course,
            department,
          })
          alert('Registration successful! Please login')
          navigate('/login')
        } catch (error) {
    console.log('Full error:', error)
    console.log('Response data:', error?.response?.data)
    console.log('Message:', error?.message)
    const msg =
      error?.response?.data?.error ||
      error?.response?.data?.detail ||
      JSON.stringify(error?.response?.data) ||
      error?.message ||
      'Server error'
    alert(msg);
}
      };

      return (
        <div className="login-container">
            <div className="app-title" >Internship System</div>
            <div className="welcome-text" >Create Account</div>
            <div className="subtitle" >Select your role and register</div>

            <div className="role-selector">
                {roles.map((role) => (
                    <button
                      key={role.value}
                      className={selectedRole === role.value ? 'active' : ''}
                      onClick={() => setSelectedRole(role.value)}
                    >
                        {role.label}
                    </button>
                ))}
            </div>

            <form className="login-form" onSubmit={handleRegister}>
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  />

                <label>Email</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  />

                {selectedRole === 'student' && (
                  <>
                    <label>Student Number</label>
                    <input
                         type="text"
                         placeholder="Student Number"
                         value={studentNumber}
                         onChange={(e) => setStudentNumber(e.target.value)}
                    />

                    <label>Course</label>
                    <input
                      type="text"
                      placeholder="e.g. BSc Computer Science"
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      required
                    />
                  </>
                )}

                <label>Department</label>
                <input
                  type="text"
                  placeholder="e.g. Faculty of Computing"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                  />

                <label>Password (at least 8 characters)</label>
                <div className="password-field">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength="8"
                  required
                  />
                  <span
                    className="toggle-visibility"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                    </span>
                  </div>

                  <button type="submit" className="login-button">Register</button>

                  <Link to="/login" className="forgot-link">Already have an account? Login</Link>
                </form>
             </div>
      );
    }
