import React from 'react';
import { 
  Users, 
  Calendar, 
  ClipboardList, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  PlayCircle
} from 'lucide-react';

// Logic & Tools
import { useAuth } from '../../hooks/useAuth'; //
import { formatDate } from '../../utils/formatters'; //

const DoctorDashboard = () => {
  const { user } = useAuth(); //

  // Mock data for the provider's daily queue
  const todayAppointments = [
    { id: 'APT-101', patient: 'Robert Fox', time: '09:00 AM', reason: 'Hypertension Follow-up', status: 'In-Queue' },
    { id: 'APT-102', patient: 'Jane Cooper', time: '10:30 AM', reason: 'Post-Op Review', status: 'In-Queue' },
    { id: 'APT-103', patient: 'Cody Fisher', time: '11:15 AM', reason: 'Acute Sinusitis', status: 'Completed' },
  ];

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* 1. Provider Welcome Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">
            Welcome, Dr. {user?.name?.split(' ').pop() || 'Provider'}
          </h1>
          <p className="text-slate-500 mt-1">
            You have {todayAppointments.filter(a => a.status === 'In-Queue').length} appointments remaining today.
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 flex items-center gap-3">
          <Calendar className="text-indigo-600" size={20} />
          <span className="font-bold text-slate-700">{formatDate(new Date(), 'full')}</span>
        </div>
      </header>

      {/* 2. Provider Stats (Feature: UserManagement) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Patients', value: '1,284', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Appointments', value: '12', icon: Calendar, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Pending Results', value: '08', icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Completed', value: '04', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div className={`${stat.bg} ${stat.color} w-10 h-10 rounded-lg flex items-center justify-center mb-3`}>
              <stat.icon size={20} />
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 3. Patient Queue (Feature: Consultation) */}
        <section className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Patient Queue</h2>
            <button className="text-sm font-bold text-indigo-600">View Full Schedule</button>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {todayAppointments.map((apt) => (
              <div key={apt.id} className="p-5 flex items-center justify-between border-b last:border-0 border-slate-50 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex flex-col items-center justify-center text-slate-500">
                    <Clock size={16} />
                    <span className="text-[10px] font-bold uppercase">{apt.time.split(' ')[1]}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{apt.patient}</h4>
                    <p className="text-xs text-slate-500">{apt.reason}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    apt.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'
                  }`}>
                    {apt.status}
                  </span>
                  {apt.status !== 'Completed' && (
                    <button className="bg-slate-900 text-white p-2 rounded-lg hover:bg-indigo-600 transition-colors">
                      <PlayCircle size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Lab Review Requests (Feature: Results) */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Needs Review</h2>
          <div className="space-y-3">
            {[
              { patient: 'Guy Hawkins', test: 'Complete Blood Count', priority: 'High' },
              { patient: 'Esther Howard', test: 'Thyroid Profile', priority: 'Routine' }
            ].map((item, i) => (
              <div key={i} className="bg-white p-4 rounded-xl border border-slate-100 flex items-start gap-4 hover:border-indigo-200 transition-all cursor-pointer">
                <div className={`p-2 rounded-lg ${item.priority === 'High' ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-600'}`}>
                  <ClipboardList size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-900">{item.patient}</h4>
                  <p className="text-xs text-slate-500">{item.test}</p>
                </div>
                <span className={`text-[10px] font-black uppercase ${item.priority === 'High' ? 'text-rose-600' : 'text-slate-400'}`}>
                  {item.priority}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default DoctorDashboard;