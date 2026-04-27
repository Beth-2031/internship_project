import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './STYLES/loginPage.css';
import { register as apiRegister } from './api/client'

const roles = [
    {label: 'Student Intern', value: 'student' },
    {label: 'Internship Administrator', value: 'internship_admin' },
];

export default function RegisterPage() {
    const [selectedRole, setSelectedRole] = useState('student');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [course, setCourse] = useState('');
    const [department, setDepartment] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate()

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
          await apiRegister({
            email,
            password,
            role: selectedRole,
            full_name: fullName,
            course,
            department,
          })
          alert('Registration successful! Please login')
          navigate('/login')
        } catch (error) {
            const msg =
              error?.response?.data?.error ||
              error?.message ||
              'Server error. Is Django running?'
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

                <label>Course</label>
                <input
                  type="text"
                  placeholder="e.g. BSc Computer Science"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  required
                  />

                <label>Department</label>
                <input
                  type="text"
                  placeholder="e.g. Faculty of Computing"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                  />

                <label>Password</label>
                <div className="password-field">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

                  <a href="/login" className="forgot-link">Already have an account? Login</a>
                </form>
             </div>
      );
    }
