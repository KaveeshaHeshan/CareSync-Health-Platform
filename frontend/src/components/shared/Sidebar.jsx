import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  UserCircle, 
  ClipboardList, 
  Stethoscope, 
  Settings, 
  LogOut,
  Microscope,
  CreditCard
} from 'lucide-react';

import { useAuth } from '../../hooks/useAuth';

const Sidebar = ({ userRole = 'patient' }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  // Define navigation based on the user's role
  const menuConfig = {
    patient: [
      { name: 'Dashboard', path: '/patient/dashboard', icon: LayoutDashboard },
      { name: 'Book Appointment', path: '/patient/booking', icon: Calendar },
      { name: 'My Results', path: '/patient/lab-results', icon: Microscope },
      { name: 'Payments', path: '/billing/checkout', icon: CreditCard },
    ],
    doctor: [
      { name: 'Overview', path: '/doctor/dashboard', icon: LayoutDashboard },
      { name: 'Schedule', path: '/doctor/schedule', icon: Calendar },
    ],
    admin: [
      { name: 'Admin Console', path: '/admin/dashboard', icon: LayoutDashboard },
    ]
  };

  const menuItems = menuConfig[userRole] || [];

  return (
    <aside className="w-64 h-screen bg-white border-r border-slate-100 flex flex-col sticky top-0">
      {/* Logo Section */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200">
          C
        </div>
        <span className="text-xl font-bold bg-linear-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
          CareSync
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
              ${isActive 
                ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
            `}
          >
            <item.icon size={20} />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-slate-50 space-y-2">
        <NavLink
          to={
            userRole === 'doctor'
              ? '/doctor/dashboard'
              : userRole === 'admin'
                ? '/admin/dashboard'
                : '/patient/dashboard'
          }
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50 transition-all"
        >
          <Settings size={20} />
          Settings
        </NavLink>
        
        <button
          type="button"
          onClick={async () => {
            try {
              await logout();
            } finally {
              navigate('/login', { replace: true });
            }
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;