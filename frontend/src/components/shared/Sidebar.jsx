import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Users,
  FileText,
  Settings,
  Stethoscope,
  ClipboardList,
  DollarSign,
  BarChart3,
  Heart,
  Video,
  TestTube,
  Pill,
  User,
  Activity,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import authApi from '../../api/authApi';

const Sidebar = ({ isCollapsed, toggleSidebar }) => {
  const location = useLocation();
  const user = authApi.getCurrentUser();

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Get navigation items based on user role
  const getNavItems = () => {
    if (!user) return [];

    switch (user.role) {
      case 'PATIENT':
        return [
          { path: '/patient/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { path: '/patient/find-doctors', label: 'Find Doctors', icon: Stethoscope },
          { path: '/patient/appointments', label: 'My Appointments', icon: Calendar },
          { path: '/patient/medical-records', label: 'Medical Records', icon: FileText },
          { path: '/patient/prescriptions', label: 'Prescriptions', icon: Pill },
          { path: '/patient/lab-results', label: 'Lab Results', icon: TestTube },
          { path: '/patient/billing', label: 'Billing', icon: DollarSign },
          { path: '/patient/profile', label: 'Profile', icon: User },
        ];
      
      case 'DOCTOR':
        return [
          { path: '/doctor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { path: '/doctor/appointments', label: 'Appointments', icon: Calendar },
          { path: '/doctor/patients', label: 'My Patients', icon: Users },
          { path: '/doctor/schedule', label: 'Schedule', icon: ClipboardList },
          { path: '/doctor/consultations', label: 'Video Consultations', icon: Video },
          { path: '/doctor/earnings', label: 'Earnings', icon: DollarSign },
          { path: '/doctor/profile', label: 'Profile', icon: User },
          { path: '/doctor/settings', label: 'Settings', icon: Settings },
        ];
      
      case 'ADMIN':
        return [
          { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { path: '/admin/users', label: 'Users', icon: Users },
          { path: '/admin/doctors', label: 'Doctors', icon: Stethoscope },
          { path: '/admin/appointments', label: 'Appointments', icon: Calendar },
          { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
          { path: '/admin/payments', label: 'Payments', icon: DollarSign },
          { path: '/admin/settings', label: 'Settings', icon: Settings },
        ];
      
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <aside
      className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Sidebar Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <Stethoscope className="h-6 w-6 text-indigo-600" />
            <span className="text-lg font-bold text-gray-900">CareSync</span>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5 text-gray-600" />
          ) : (
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* User Info */}
      {user && (
        <div className={`p-4 border-b border-gray-200 ${isCollapsed ? 'text-center' : ''}`}>
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium flex-shrink-0">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-indigo-100 text-indigo-800">
                  {user.role}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                    active
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                  title={isCollapsed ? item.label : ''}
                >
                  <Icon className={`h-5 w-5 flex-shrink-0 ${active ? 'text-indigo-600' : 'text-gray-500'}`} />
                  {!isCollapsed && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Quick Actions */}
      {!isCollapsed && user?.role === 'PATIENT' && (
        <div className="p-4 border-t border-gray-200">
          <Link
            to="/patient/find-doctors"
            className="block w-full px-4 py-2 text-sm font-medium text-center text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Book Appointment
          </Link>
        </div>
      )}

      {!isCollapsed && user?.role === 'DOCTOR' && (
        <div className="p-4 border-t border-gray-200">
          <Link
            to="/doctor/schedule"
            className="block w-full px-4 py-2 text-sm font-medium text-center text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Manage Schedule
          </Link>
        </div>
      )}

      {/* Footer */}
      <div className={`p-4 border-t border-gray-200 ${isCollapsed ? 'text-center' : ''}`}>
        <div className={`flex items-center space-x-3 ${isCollapsed ? 'justify-center' : ''}`}>
          <button
            onClick={() => {
              authApi.logout();
              window.location.href = '/login';
            }}
            className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors ${
              isCollapsed ? 'justify-center w-full' : ''
            }`}
            title={isCollapsed ? 'Logout' : ''}
          >
            <LogOut className="h-5 w-5" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
