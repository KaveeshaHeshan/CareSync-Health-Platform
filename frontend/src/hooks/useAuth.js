import { useContext } from 'react';
// Imports the context from the feature directory
import { AuthContext } from '../features/auth/AuthContext';

/**
 * Hook for easy access to login/logout/user state
 */
const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return {
    user: context.user,
    isAuthenticated: !!context.user,
    login: context.login,
    logout: context.logout,
    isLoading: context.isLoading,
    // Role helpers based on your UserManagement roles
    isDoctor: context.user?.role === 'Doctor',
    isAdmin: context.user?.role === 'Admin',
    isPatient: context.user?.role === 'Patient',
  };
};

export default useAuth;