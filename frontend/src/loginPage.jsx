import React, { useState } from 'react';
import './STYLES/loginPage.css';
const roles =[
    {label:'Student Intern',value: 'student'},
    {label:'Workplace Supervisor',value: 'workplace'},
    {label:'Academic Supervisor',value: 'academic'},   
    {label:'Internship Adiministator',value: 'admin'},  
];
export default function LoginPage(){
    const [selectedRole, setSelectedRole] = useState('student');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = (e) => {
        e.preventDefault();
        console.log('Logging in as:',selectedRole, email);
    };

    return (
      <div className="login-container">
        <div className="app-title">Internship System</div>
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
