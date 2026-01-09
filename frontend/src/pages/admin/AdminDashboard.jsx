import React from 'react';
import { 
  Users, 
  UserCheck, 
  DollarSign, 
  BarChart3, 
  Settings, 
  ShieldAlert,
  Search,
  MoreHorizontal
} from 'lucide-react';

// Logic & Tools
import { useAuth } from '../../hooks/useAuth'; //
import { formatCurrency, formatDate } from '../../utils/formatters'; //

const AdminDashboard = () => {
  const { user } = useAuth();

  // Mock System Stats
  const stats = [
    { label: 'Total Patients', value: '4,290', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Doctors', value: '156', icon: UserCheck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Monthly Revenue', value: 42850, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50', isCurrency: true },
    { label: 'Pending Verifications', value: '12', icon: ShieldAlert, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  // Mock User Table Data
  const recentUsers = [
    { id: 'U-991', name: 'Dr. Alana Smith', role: 'DOCTOR', joined: '2026-01-05', status: 'Active' },
    { id: 'U-992', name: 'Marcus Wright', role: 'PATIENT', joined: '2026-01-08', status: 'Pending' },
    { id: 'U-993', name: 'Dr. Kevin Vane', role: 'DOCTOR', joined: '2026-01-09', status: 'Active' },
  ];

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* 1. Admin Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">System Overview</h1>
          <p className="text-slate-500 mt-1">Global management and platform performance metrics.</p>
        </div>
        <button className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-all">
          <Settings size={18} /> System Settings
        </button>
      </header>

      {/* 2. Key Performance Indicators (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((item, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className={`${item.bg} ${item.color} w-12 h-12 rounded-xl flex items-center justify-center mb-4`}>
              <item.icon size={24} />
            </div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{item.label}</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {item.isCurrency ? formatCurrency(item.value) : item.value}
            </h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 3. User Management Table (Feature: UserManagement) */}
        <section className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Recent Registrations</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search users..." 
                className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">User</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Role</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Joined</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{u.name}</span>
                        <span className="text-xs text-slate-400">{u.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        u.role === 'DOCTOR' ? 'bg-indigo-50 text-indigo-600' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {formatDate(u.joined, 'short')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-slate-400 hover:text-slate-900">
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 4. Platform Health / Revenue Trend (Feature: Billing) */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Revenue Distribution</h2>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
            <div className="h-40 bg-slate-50 rounded-xl flex items-end justify-center gap-2 p-4">
              {/* Mock Bar Chart */}
              {[40, 70, 45, 90, 65, 80].map((h, i) => (
                <div key={i} className="w-full bg-indigo-500 rounded-t-sm" style={{ height: `${h}%` }} />
              ))}
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">Consultation Fees</span>
                <span className="font-bold text-slate-900">72%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full w-[72%]" />
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">Lab Partners</span>
                <span className="font-bold text-slate-900">28%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[28%]" />
              </div>
            </div>

            <button className="w-full py-3 bg-indigo-50 text-indigo-600 font-bold rounded-xl text-sm hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2">
              <BarChart3 size={18} /> View Financial Reports
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;