import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth'; 

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user, isInitialLoading } = useAuth();
  const location = useLocation();

  if (isInitialLoading) return <div className="p-10 text-center font-bold">Verifying Session...</div>;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;