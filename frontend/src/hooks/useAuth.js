import { useContext } from 'react';
// Imports the context from the feature directory
import { AuthContext } from '../features/auth/AuthContext';
import { ROLES } from '../utils/constants';

/**
 * Hook for easy access to login/logout/user state
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return {
    user: context.user,
    isAuthenticated: context.isAuthenticated ?? !!context.user,
    login: context.login,
    register: context.register,
    logout: context.logout,
    isLoading: context.isLoading,
    isInitialLoading: context.isInitialLoading,
    // Role helpers
    isDoctor: context.user?.role === ROLES.DOCTOR,
    isAdmin: context.user?.role === ROLES.ADMIN,
    isPatient: context.user?.role === ROLES.PATIENT,
  };
};

export default useAuth;