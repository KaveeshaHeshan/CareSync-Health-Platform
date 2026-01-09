import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Global State (Zustand) for user profile and role management.
 *
 */
const useUserStore = create(
  persist(
    (set) => ({
      // State: Current user profile & role
      user: null, 
      isAuthenticated: false,

      // Actions
      /** Sets the global user profile and role after successful authentication. */
      setUser: (userData) => set({ 
        user: userData, 
        isAuthenticated: !!userData 
      }),

      /** Clears the user profile and resets authentication state on logout. */
      clearUser: () => set({ 
        user: null, 
        isAuthenticated: false 
      }),

      /** Updates specific fields in the user profile without overwriting the whole object. */
      updateProfile: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null
      })),
    }),
    {
      name: 'caresync-user-session', // Unique name for persistence
      storage: createJSONStorage(() => localStorage), // Uses persistent browser storage logic
    }
  )
);

export default useUserStore;