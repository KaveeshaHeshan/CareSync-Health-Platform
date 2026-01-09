import { create } from 'zustand';

/**
 * Global State (Zustand) for UI-related interactions.
 *
 */
const useUIStore = create((set) => ({
  // --- Sidebar State ---
  /** Whether the main navigation sidebar is expanded or collapsed. */
  isSidebarOpen: true,

  /** Toggles the current sidebar state. */
  toggleSidebar: () => set((state) => ({ 
    isSidebarOpen: !state.isSidebarOpen 
  })),

  /** Explicitly sets the sidebar state (useful for mobile responsiveness). */
  setSidebar: (isOpen) => set({ 
    isSidebarOpen: isOpen 
  }),

  // --- Modal State ---
  /** Stores the ID or name of the currently active modal (null if none). */
  activeModal: null, 

  /**
   * Opens a specific modal by its identifier.
   * @param {string} modalName - e.g., 'BOOK_APPOINTMENT', 'UPLOAD_RESULT'
   */
  openModal: (modalName) => set({ 
    activeModal: modalName 
  }),

  /** Closes any currently open modal. */
  closeModal: () => set({ 
    activeModal: null 
  }),
}));

export default useUIStore;