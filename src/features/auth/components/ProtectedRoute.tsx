import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../../stores/authStore';
import { UserRole } from '../../../types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // If authenticated but unauthorized, redirect to their home dashboard
    const redirectPath = 
      user.role === 'teacher' ? '/teacher' :
      user.role === 'parent' ? '/parent' :
      user.role === 'student' ? '/student' : '/dashboard';
    
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};
