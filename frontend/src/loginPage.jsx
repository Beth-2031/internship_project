import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/Authcontext';
import './STYLES/loginPage.css';
const roles =[
    {label:'Student Intern',value: 'student'},
    {label:'Workplace Supervisor',value: 'workplace_supervisor'},
    {label:'Academic Supervisor',value: 'academic_supervisor'},
    {label:'Internship Adiministator',value: 'internship_admin'},
];
export default function LoginPage(){
    const { login } = useAuth();
    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState('student');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        const redirectMap = {
            student:    '/student/dashboard',
            workplace_supervisor:  '/supervisor/dashboard',
            academic_supervisor:   '/academic/dashboard',
            internship_admin:      '/admin/dashboard',
        };

        setError('');
        setLoading(true);
        try {
          const user = await login(email, password);
          if (!user) {
            setError('Login failed. Please try again.');
            return;
          }
          if (selectedRole !== user.user_type) {
            setError(`This account is ${user.user_type.replaceAll('_', ' ')}. Please select the correct role.`);
            return;
          }
          navigate(redirectMap[user.user_type] || '/');
        } catch {
          setError('Invalid email or password.');
        } finally {
          setLoading(false);
        }
    };

    return (
      <div className="login-container">
        <div className="app-title">Internship Management System</div>
        <div className="welcome-text">Welcome Back!</div>
        <div className="subtitle">Select your role and sign in to continue</div>
        
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
        
        <form className="login-form" onSubmit={handleLogin}>
           {error && <div className="forgot-link" style={{ color: '#ef4444', marginBottom: '10px' }}>{error}</div>}
           <label>Email</label>
           <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

            <a href="#" className="forgot-link">Forgot password?</a>

             <button type="submit" className="Login-button" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
           </form>
         </div>
        );
    }
