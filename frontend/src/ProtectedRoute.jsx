import React from 'react'
import { Navigate } from 'react-router-dom';
import { useAuth } from './context/Authcontext'

export default function ProtectedRoute({ children, allowedRoles }) {
    const { user, loading } = useAuth();


    if (loading) return <div>Loading...</div>
    if (!user) return <Navigate to="/" />
    if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" />

  return children
}
   