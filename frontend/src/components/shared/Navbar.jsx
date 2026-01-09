import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Menu, 
  ChevronDown, 
  User, 
  Settings, 
  LogOut,
  HelpCircle,
  MessageSquare
} from 'lucide-react';
// import useUserStore from '../../store/useUserStore'; // Uncomment once store is created

const Navbar = ({ onMenuClick }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // In a real app, we get this from our global store:
  // const { user, logout } = useUserStore(); 
  const user = { name: "Dr. Sarah Johnson", role: "Cardiologist" }; // Placeholder

  return (
    <header className="h-20 bg-white border-b border-slate-100 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
      
      {/* 1. SEARCH & MOBILE TOGGLE */}
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={onMenuClick}
          className="p-2 lg:hidden hover:bg-slate-50 rounded-xl text-slate-500 transition-colors"
        >
          <Menu size={22} />
        </button>

        <div className="relative max-w-md w-full hidden md:block group">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
            <Search size={18} />
          </span>
          <input 
            type="text" 
            placeholder="Search patients, records, or appointments..."
            className="w-full bg-slate-50 border-none rounded-2xl py-2.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
          />
        </div>
      </div>

      {/* 2. ACTIONS & USER PROFILE */}
      <div className="flex items-center gap-2 sm:gap-4">
        
        {/* Messages / Chat Link */}
        <button className="p-2.5 text-slate-500 hover:bg-slate-50 rounded-full transition-colors hidden sm:block relative">
          <MessageSquare size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 border-2 border-white rounded-full"></span>
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="p-2.5 text-slate-500 hover:bg-slate-50 rounded-full transition-colors relative"
          >
            <Bell size={20} />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
          </button>
          
          {/* Simple Notification Dropdown */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-100 rounded-3xl shadow-2xl py-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-6 pb-2 border-b border-slate-50 flex justify-between items-center">
                <span className="font-bold text-slate-800">Notifications</span>
                <span className="text-xs text-indigo-600 font-medium cursor-pointer">Mark all read</span>
              </div>
              <div className="p-4 text-center text-sm text-slate-500">
                No new alerts from the lab.
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-8 bg-slate-100 mx-1 hidden sm:block"></div>

        {/* User Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 p-1.5 hover:bg-slate-50 rounded-2xl transition-all"
          >
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-violet-600 text-white rounded-xl flex items-center justify-center font-bold shadow-md shadow-indigo-100">
              {user.name.charAt(0)}
            </div>
            <div className="text-left hidden lg:block">
              <p className="text-sm font-bold text-slate-800 leading-none">{user.name}</p>
              <p className="text-[11px] text-slate-500 mt-1 font-semibold uppercase tracking-wider">{user.role}</p>
            </div>
            <ChevronDown size={16} className={`text-slate-400 transition-transform hidden sm:block ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Profile Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-white border border-slate-100 rounded-3xl shadow-2xl py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="px-4 py-3 border-b border-slate-50 lg:hidden">
                <p className="text-sm font-bold text-slate-800">{user.name}</p>
                <p className="text-xs text-slate-500">{user.role}</p>
              </div>
              <button className="w-full flex items-center gap-3 px-5 py-3 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                <User size={18} />
                My Profile
              </button>
              <button className="w-full flex items-center gap-3 px-5 py-3 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                <Settings size={18} />
                Settings
              </button>
              <div className="h-px bg-slate-50 my-1"></div>
              <button className="w-full flex items-center gap-3 px-5 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors font-medium">
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;