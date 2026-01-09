import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  FileText, 
  Download, 
  ExternalLink,
  Calendar,
  User,
  Clock
} from 'lucide-react';

// Logic & Tools
import { useAuth } from '../../hooks/useAuth'; //
import { formatDate } from '../../utils/formatters'; //

const HistoryPage = () => {
  const { user } = useAuth();
  const [filterType, setFilterType] = useState('All');

  // Mock data representing the Consultation & Results features
  const medicalHistory = [
    {
      id: 'REC-001',
      date: '2025-11-15',
      doctor: 'Dr. Sarah Mitchell',
      specialty: 'Cardiology',
      type: 'Consultation',
      reason: 'Regular Heart Checkup',
      status: 'Completed',
      attachment: true
    },
    {
      id: 'REC-002',
      date: '2025-10-12',
      doctor: 'Lab Services',
      specialty: 'Hematology',
      type: 'Lab Result',
      reason: 'Full Blood Count',
      status: 'Reviewed',
      attachment: true
    },
    {
      id: 'REC-003',
      date: '2025-08-05',
      doctor: 'Dr. James Wilson',
      specialty: 'Dermatology',
      type: 'Prescription',
      reason: 'Skin Rash Treatment',
      status: 'Completed',
      attachment: false
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* 1. Page Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Medical History</h1>
          <p className="text-slate-500 mt-1">Access your past consultations, reports, and digital prescriptions.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search records..." 
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-64"
            />
          </div>
          <button className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50">
            <Filter size={20} />
          </button>
        </div>
      </header>

      {/* 2. History Summary Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
          <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Total Consultations</p>
          <h3 className="text-2xl font-black text-indigo-900 mt-1">24</h3>
        </div>
        <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Lab Reports</p>
          <h3 className="text-2xl font-black text-emerald-900 mt-1">12</h3>
        </div>
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Digital Prescriptions</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">08</h3>
        </div>
      </div>

      {/* 3. Records List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Date & Reference</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Healthcare Provider</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Reason / Type</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {medicalHistory.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900">{formatDate(record.date, 'short')}</span>
                      <span className="text-xs text-slate-400 font-mono">{record.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                        <User size={16} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">{record.doctor}</span>
                        <span className="text-xs text-indigo-600">{record.specialty}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-700">{record.reason}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{record.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      record.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {record.attachment && (
                        <button title="Download PDF" className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                          <Download size={18} />
                        </button>
                      )}
                      <button title="View Details" className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all">
                        <ExternalLink size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;