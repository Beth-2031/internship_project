import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './STYLES/loginPage.css';
import { useAuth } from './context/Authcontext'
const roles =[
    {label:'Student Intern',value: 'student'},
    {label:'Workplace Supervisor',value: 'workplace'},
    {label:'Academic Supervisor',value: 'academic'},   
    {label:'Internship Adiministator',value: 'admin'},  
];
export default function LoginPage(){
    const navigate = useNavigate();
    const { login } = useAuth()
    const [selectedRole, setSelectedRole] = useState('student');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
          await login(email, password, selectedRole)
        } catch (error) {
          const msg =
            error?.response?.data?.error ||
            error?.message ||
            'Login failed. Is Django running?'
          alert(msg)
          return
        }
        
        const redirectMap = {
            student:    '/student/dashboard',
            workplace:  '/supervisor/dashboard',
            academic:   '/academic/dashboard',
            admin:      '/admin/dashboard',
    };
        navigate(redirectMap[selectedRole]);
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

             <button type="submit" className="Login-button">Login</button>
           </form>
         </div>
        );
    }
