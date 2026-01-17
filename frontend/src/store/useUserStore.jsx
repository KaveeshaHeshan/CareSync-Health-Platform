import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useUserStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      // Actions
      setUser: (user) => 
        set({ 
          user, 
          isAuthenticated: !!user,
          error: null 
        }),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ error }),

      clearError: () => set({ error: null }),

      login: (user, token) => {
        if (token) {
          localStorage.setItem('token', token);
        }
        set({
          user,
          isAuthenticated: true,
          error: null,
          loading: false,
        });
      },

      logout: () => {
        localStorage.removeItem('token');
        set({
          user: null,
          isAuthenticated: false,
          error: null,
          loading: false,
        });
      },

      // Getters
      getUser: () => get().user,
      
      getUserRole: () => get().user?.role || null,

      isRole: (role) => get().user?.role === role,

      isPatient: () => get().user?.role === 'PATIENT',

      isDoctor: () => get().user?.role === 'DOCTOR',

      isAdmin: () => get().user?.role === 'ADMIN',

      getUserId: () => get().user?._id || null,

      getUserName: () => get().user?.name || '',

      getUserEmail: () => get().user?.email || '',
    }),
    {
      name: 'user-storage', // localStorage key
      partialPersist: true,
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export { useUserStore };
export default useUserStore;
