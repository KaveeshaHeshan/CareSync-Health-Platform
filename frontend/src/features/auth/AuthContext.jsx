import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import authApi from '../../api/authApi';
import useUserStore from '../../store/useUserStore';

export const AuthContext = createContext(null);

let didBootstrapOnce = false;

const normalizeRole = (role) => {
  if (!role || typeof role !== 'string') return role;
  const upper = role.toUpperCase();
  if (upper === 'PATIENT' || upper === 'DOCTOR' || upper === 'ADMIN') return upper;
  return role;
};

const normalizeUser = (user) => {
  if (!user || typeof user !== 'object') return user;
  return {
    ...user,
    role: normalizeRole(user.role),
  };
};

export const AuthProvider = ({ children }) => {
  const { user, setUser, clearUser } = useUserStore();

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // React 18 StrictMode intentionally mounts/unmounts twice in dev.
    // This guard prevents duplicate network calls like /auth/me.
    if (didBootstrapOnce) {
      setIsInitialLoading(false);
      return;
    }
    didBootstrapOnce = true;

    let isActive = true;

    const bootstrap = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        clearUser();
        if (isActive) setIsInitialLoading(false);
        return;
      }

      // If we already have a user in persisted state, don't block UI on /me.
      if (user) {
        if (isActive) setIsInitialLoading(false);
        return;
      }

      try {
        const meResponse = await authApi.getMe();
        const me = normalizeUser(meResponse?.user ?? meResponse);
        setUser(me);
      } catch {
        // Backend unreachable/invalid token: treat as logged out.
        localStorage.removeItem('token');
        clearUser();
      } finally {
        if (isActive) setIsInitialLoading(false);
      }
    };

    bootstrap();

    return () => {
      isActive = false;
    };
  }, [clearUser, setUser]);

  const login = useCallback(
    async (credentials) => {
      setIsLoading(true);
      try {
        const response = await authApi.login(credentials);

        const token = response?.token ?? response?.accessToken;
        if (token) localStorage.setItem('token', token);

        const nextUser = normalizeUser(response?.user ?? response?.profile ?? response);
        if (nextUser && typeof nextUser === 'object') setUser(nextUser);

        return response;
      } finally {
        setIsLoading(false);
      }
    },
    [setUser]
  );

  const register = useCallback(
    async (userData) => {
      setIsLoading(true);
      try {
        const response = await authApi.register(userData);

        const token = response?.token ?? response?.accessToken;
        if (token) localStorage.setItem('token', token);

        const nextUser = normalizeUser(response?.user ?? response?.profile ?? response);
        if (nextUser && typeof nextUser === 'object') setUser(nextUser);

        return response;
      } finally {
        setIsLoading(false);
      }
    },
    [setUser]
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      try {
        await authApi.logout();
      } catch {
        // ignore
      }

      localStorage.removeItem('token');
      clearUser();
    } finally {
      setIsLoading(false);
    }
  }, [clearUser]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      isLoading,
      isInitialLoading,
    }),
    [user, login, register, logout, isLoading, isInitialLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
