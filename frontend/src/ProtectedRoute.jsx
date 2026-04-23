import React from 'react'
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/Authcontext'

export default function ProtectedRoute({ children, allowedRoles }) {
    const { user, loading } = useAuth();
    const location = useLocation();


    if (loading) return <div>Loading...</div>
    if (!user) {
      return (
        <Navigate
          to="/"
          replace
          state={{
            authMessage: 'Please log in to access that page.',
            from: location.pathname,
          }}
        />
      )
    }
    if (allowedRoles && !allowedRoles.includes(user.user_type)) {
      return (
        <Navigate
          to="/"
          replace
          state={{
            authMessage: `Access denied for ${user.user_type.replaceAll('_', ' ')}.`,
            from: location.pathname,
          }}
        />
      )
    }

  return children
}
   