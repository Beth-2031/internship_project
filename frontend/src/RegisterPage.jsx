import React, { useState } from 'react';
import './STYLES/loginPage.css';

const roles =[
    {label: 'Student Intern', value: 'student' },
    {label: 'Workplace Supervisor', value: 'workplace' },
    {label: 'Academic Supervisor', value: 'academic' },
    {label: 'Internship Adimistrator', value: 'admin' },
];

export default function RegisterPage() {
    const [selectedRole, setSelectedRole] = useState('student');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
          const response = await fetch('http://127.0.0.1:8000/api/register/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, role: selectedRole }),
          });
          const data = await response.json();
          if (response.ok) {
            alert('Registration successful! Please login');
            window.location.href = '/';
          } else {
            alert(data.error);
          }
        } catch (error) {
            alert('Server error. Is Django running?');
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
                <label>Email</label>
                <input
                  type ="email" 
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  />

                <label>Password</label>
                <div className="password-field">
                <input
                  type ={showPassword ? 'text' : 'password'}
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

                  <a href="/" className="forgot-link">Already have an account? Login</a>
                </form>
             </div>
      );
    }
