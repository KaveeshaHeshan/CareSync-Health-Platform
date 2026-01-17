import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useUIStore = create(
  persist(
    (set, get) => ({
      // Sidebar state
      sidebarOpen: true,
      sidebarCollapsed: false,

      // Modal states
      modals: {
        appointment: false,
        prescription: false,
        profile: false,
        payment: false,
      },

      // Theme
      theme: 'light', // 'light' | 'dark'

      // Notifications
      notifications: [],
      notificationCount: 0,

      // Loading states
      globalLoading: false,
      pageLoading: false,

      // Toast messages
      toasts: [],

      // Search/Filter states
      searchQuery: '',
      filters: {},

      // Actions - Sidebar
      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      toggleSidebarCollapse: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      // Actions - Modals
      openModal: (modalName) =>
        set((state) => ({
          modals: { ...state.modals, [modalName]: true },
        })),

      closeModal: (modalName) =>
        set((state) => ({
          modals: { ...state.modals, [modalName]: false },
        })),

      closeAllModals: () =>
        set((state) => ({
          modals: Object.keys(state.modals).reduce((acc, key) => {
            acc[key] = false;
            return acc;
          }, {}),
        })),

      isModalOpen: (modalName) => get().modals[modalName] || false,

      // Actions - Theme
      setTheme: (theme) => set({ theme }),

      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),

      // Actions - Notifications
      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            {
              id: Date.now(),
              timestamp: new Date().toISOString(),
              read: false,
              ...notification,
            },
            ...state.notifications,
          ],
          notificationCount: state.notificationCount + 1,
        })),

      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),

      markNotificationAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
          notificationCount: Math.max(0, state.notificationCount - 1),
        })),

      markAllNotificationsAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          notificationCount: 0,
        })),

      clearNotifications: () =>
        set({ notifications: [], notificationCount: 0 }),

      // Actions - Loading
      setGlobalLoading: (loading) => set({ globalLoading: loading }),

      setPageLoading: (loading) => set({ pageLoading: loading }),

      // Actions - Toast
      addToast: (toast) =>
        set((state) => ({
          toasts: [
            {
              id: Date.now() + Math.random(),
              type: 'info',
              duration: 3000,
              ...toast,
            },
            ...state.toasts,
          ],
        })),

      removeToast: (id) =>
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        })),

      clearToasts: () => set({ toasts: [] }),

      // Actions - Search/Filter
      setSearchQuery: (query) => set({ searchQuery: query }),

      clearSearchQuery: () => set({ searchQuery: '' }),

      setFilter: (key, value) =>
        set((state) => ({
          filters: { ...state.filters, [key]: value },
        })),

      setFilters: (filters) => set({ filters }),

      clearFilter: (key) =>
        set((state) => {
          const newFilters = { ...state.filters };
          delete newFilters[key];
          return { filters: newFilters };
        }),

      clearAllFilters: () => set({ filters: {} }),

      // Getters
      getUnreadNotificationCount: () =>
        get().notifications.filter((n) => !n.read).length,

      hasActiveFilters: () => Object.keys(get().filters).length > 0,
    }),
    {
      name: 'ui-storage', // localStorage key
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
      }),
    }
  )
);

export default useUIStore;
