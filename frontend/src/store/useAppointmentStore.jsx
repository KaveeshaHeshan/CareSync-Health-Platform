import { create } from 'zustand';
import appointmentApi from '../api/appointmentApi';

const useAppointmentStore = create((set, get) => ({
  // State
  appointments: [],
  selectedAppointment: null,
  loading: false,
  error: null,

  // Filters
  filters: {
    status: 'all', // 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'
    type: 'all', // 'all' | 'in-person' | 'online'
    dateRange: null,
    doctorId: null,
    patientId: null,
  },

  // Pagination
  currentPage: 1,
  totalPages: 1,
  totalAppointments: 0,
  perPage: 10,

  // Statistics
  stats: {
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
  },

  // Actions - Fetch
  fetchAppointments: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const filters = get().filters;
      const queryParams = { ...filters, ...params };
      
      const response = await appointmentApi.getAll(queryParams);
      
      set({
        appointments: response.appointments || response.data || [],
        totalAppointments: response.total || response.appointments?.length || 0,
        totalPages: response.pages || 1,
        loading: false,
      });

      // Update stats if available
      if (response.stats) {
        set({ stats: response.stats });
      } else {
        get().calculateStats();
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to fetch appointments',
        loading: false,
      });
    }
  },

  fetchAppointmentById: async (id) => {
    set({ loading: true, error: null });
    try {
      const appointment = await appointmentApi.getById(id);
      set({
        selectedAppointment: appointment,
        loading: false,
      });
      return appointment;
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to fetch appointment',
        loading: false,
      });
      throw error;
    }
  },

  // Actions - Create/Update/Delete
  createAppointment: async (appointmentData) => {
    set({ loading: true, error: null });
    try {
      const newAppointment = await appointmentApi.create(appointmentData);
      set((state) => ({
        appointments: [newAppointment, ...state.appointments],
        loading: false,
      }));
      get().calculateStats();
      return newAppointment;
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to create appointment',
        loading: false,
      });
      throw error;
    }
  },

  updateAppointment: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const updatedAppointment = await appointmentApi.update(id, updates);
      set((state) => ({
        appointments: state.appointments.map((apt) =>
          apt._id === id ? updatedAppointment : apt
        ),
        selectedAppointment:
          state.selectedAppointment?._id === id
            ? updatedAppointment
            : state.selectedAppointment,
        loading: false,
      }));
      get().calculateStats();
      return updatedAppointment;
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to update appointment',
        loading: false,
      });
      throw error;
    }
  },

  cancelAppointment: async (id, reason) => {
    set({ loading: true, error: null });
    try {
      const cancelledAppointment = await appointmentApi.cancel(id, reason);
      set((state) => ({
        appointments: state.appointments.map((apt) =>
          apt._id === id ? { ...apt, status: 'cancelled' } : apt
        ),
        loading: false,
      }));
      get().calculateStats();
      return cancelledAppointment;
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to cancel appointment',
        loading: false,
      });
      throw error;
    }
  },

  deleteAppointment: async (id) => {
    set({ loading: true, error: null });
    try {
      await appointmentApi.delete(id);
      set((state) => ({
        appointments: state.appointments.filter((apt) => apt._id !== id),
        selectedAppointment:
          state.selectedAppointment?._id === id ? null : state.selectedAppointment,
        loading: false,
      }));
      get().calculateStats();
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to delete appointment',
        loading: false,
      });
      throw error;
    }
  },

  // Actions - Selection
  setSelectedAppointment: (appointment) => set({ selectedAppointment: appointment }),

  clearSelectedAppointment: () => set({ selectedAppointment: null }),

  // Actions - Filters
  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

  clearFilters: () =>
    set({
      filters: {
        status: 'all',
        type: 'all',
        dateRange: null,
        doctorId: null,
        patientId: null,
      },
    }),

  // Actions - Pagination
  setPage: (page) => {
    set({ currentPage: page });
    get().fetchAppointments({ page });
  },

  setPerPage: (perPage) => {
    set({ perPage, currentPage: 1 });
    get().fetchAppointments({ perPage, page: 1 });
  },

  // Actions - Error
  setError: (error) => set({ error }),

  clearError: () => set({ error: null }),

  // Actions - Stats
  calculateStats: () => {
    const appointments = get().appointments;
    const stats = {
      total: appointments.length,
      pending: appointments.filter((apt) => apt.status === 'pending').length,
      confirmed: appointments.filter((apt) => apt.status === 'confirmed').length,
      completed: appointments.filter((apt) => apt.status === 'completed').length,
      cancelled: appointments.filter((apt) => apt.status === 'cancelled').length,
    };
    set({ stats });
  },

  // Getters
  getAppointmentById: (id) => {
    return get().appointments.find((apt) => apt._id === id);
  },

  getUpcomingAppointments: () => {
    const now = new Date();
    return get()
      .appointments.filter(
        (apt) =>
          (apt.status === 'pending' || apt.status === 'confirmed') &&
          new Date(apt.date) >= now
      )
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  },

  getPastAppointments: () => {
    const now = new Date();
    return get()
      .appointments.filter(
        (apt) =>
          apt.status === 'completed' && new Date(apt.date) < now
      )
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  getTodayAppointments: () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return get()
      .appointments.filter((apt) => {
        const aptDate = new Date(apt.date);
        return aptDate >= today && aptDate < tomorrow;
      })
      .sort((a, b) => a.time.localeCompare(b.time));
  },

  getFilteredAppointments: () => {
    const { appointments, filters } = get();
    
    return appointments.filter((apt) => {
      // Status filter
      if (filters.status !== 'all' && apt.status !== filters.status) {
        return false;
      }

      // Type filter
      if (filters.type !== 'all' && apt.type !== filters.type) {
        return false;
      }

      // Doctor filter
      if (filters.doctorId && apt.doctor?._id !== filters.doctorId) {
        return false;
      }

      // Patient filter
      if (filters.patientId && apt.patient?._id !== filters.patientId) {
        return false;
      }

      // Date range filter
      if (filters.dateRange) {
        const aptDate = new Date(apt.date);
        const { start, end } = filters.dateRange;
        if (start && aptDate < new Date(start)) return false;
        if (end && aptDate > new Date(end)) return false;
      }

      return true;
    });
  },

  // Reset store
  reset: () =>
    set({
      appointments: [],
      selectedAppointment: null,
      loading: false,
      error: null,
      filters: {
        status: 'all',
        type: 'all',
        dateRange: null,
        doctorId: null,
        patientId: null,
      },
      currentPage: 1,
      totalPages: 1,
      totalAppointments: 0,
      stats: {
        total: 0,
        pending: 0,
        confirmed: 0,
        completed: 0,
        cancelled: 0,
      },
    }),
}));

export default useAppointmentStore;
