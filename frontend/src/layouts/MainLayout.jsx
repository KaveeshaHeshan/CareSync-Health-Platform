import React, { useMemo } from 'react';
import { Outlet } from 'react-router-dom';

import Sidebar from '../components/shared/Sidebar';
import Modal from '../components/ui/Modal';
import BookingFlow from '../features/patient/BookingFlow';
import { useUIStore } from '../store/useUIStore';
import { useAuth } from '../hooks/useAuth';

const MainLayout = () => {
  const { user } = useAuth();
  const activeModal = useUIStore((s) => s.activeModal);
  const closeModal = useUIStore((s) => s.closeModal);

  const userRole = useMemo(() => {
    const role = user?.role;
    if (!role) return 'patient';
    if (typeof role === 'string') return role.toLowerCase();
    return 'patient';
  }, [user?.role]);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="hidden md:block">
        <Sidebar userRole={userRole} />
      </div>

      <div className="flex-1 flex flex-col">
        {/* Navbar Placeholder */}
        <nav className="h-16 bg-white border-b border-slate-100 flex items-center px-8">
          <span className="font-bold text-slate-700">Medical Portal</span>
        </nav>

        {/* This is where the specific page content (Dashboard, etc.) is rendered */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <Modal
        isOpen={activeModal === 'BOOKING_FLOW'}
        onClose={closeModal}
        title="Book Appointment"
        size="lg"
      >
        <BookingFlow />
      </Modal>
    </div>
  );
};

export default MainLayout;