import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Spinner from '../ui/Spinner';
// import useUserStore from '../../store/useUserStore'; // Import your Zustand store

const ProtectedRoute = ({ children, allowedRoles }) => {
  const location = useLocation();
  
  // 1. Get auth state from your global store
  // In a real app, use: const { user, token, isLoading } = useUserStore();
  const isLoading = false; // Placeholder
  const token = localStorage.getItem('token'); // Simple check for now
  const user = { role: 'patient' }; // Placeholder - this should come from your store/API

  // 2. Show loading spinner while checking auth status
  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <Spinner size="xl" label="Verifying security credentials..." />
      </div>
    );
  }

  // 3. If no token, redirect to login but save the current location
  // so we can send them back after they log in.
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 4. If roles are specified, check if the user has permission
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 5. If everything is fine, render the protected component
  return children;
};

export default ProtectedRoute;