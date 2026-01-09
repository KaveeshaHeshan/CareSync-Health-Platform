import React from 'react';
import { 
  Calendar, 
  FileText, 
  Activity, 
  Clock, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';

// Logic & Tools
import { useAuth } from '../../hooks/useAuth'; //
import { formatDate } from '../../utils/formatters'; //

const PatientDashboard = () => {
  const { user } = useAuth(); // Access global user state

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* 1. Hero Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">
            Welcome back, {user?.name?.split(' ')[0] || 'Patient'}
          </h1>
          <p className="text-slate-500 mt-1">Here is a summary of your health status and upcoming visits.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2">
            <Calendar size={18} /> Book Appointment
          </button>
        </div>
      </header>

      {/* 2. Vitals Overview (Logic from UserManagement/Results) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Heart Rate', value: '72 bpm', status: 'Normal', icon: Activity, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'Glucose', value: '98 mg/dL', status: 'Optimal', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Next Visit', value: 'Oct 24', status: 'In 3 days', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start">
              <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}>
                <stat.icon size={24} />
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.bg} ${stat.color}`}>
                {stat.status}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 3. Upcoming Appointments (Feature: Consultation) */}
        <section className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Upcoming Appointments</h2>
            <button className="text-indigo-600 text-sm font-bold flex items-center gap-1">
              View All <ArrowRight size={16} />
            </button>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {[1, 2].map((_, i) => (
              <div key={i} className="p-4 flex items-center justify-between border-b last:border-0 border-slate-50 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600">
                    DR
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Dr. Sarah Mitchell</h4>
                    <p className="text-xs text-slate-500">Cardiology • General Checkup</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">{formatDate(new Date(), 'short')}</p>
                  <p className="text-xs text-indigo-600 font-medium">10:30 AM</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Recent Lab Results (Feature: Results) */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Recent Results</h2>
          <div className="space-y-3">
            {[
              { name: 'Blood Panel', date: '2 days ago', status: 'Ready' },
              { name: 'X-Ray Chest', date: '1 week ago', status: 'Reviewed' }
            ].map((result, i) => (
              <div key={i} className="bg-white p-4 rounded-xl border border-slate-100 flex items-center gap-4">
                <div className="bg-indigo-50 text-indigo-600 p-2 rounded-lg">
                  <FileText size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-900">{result.name}</h4>
                  <p className="text-xs text-slate-500">{result.date}</p>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                  {result.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default PatientDashboard;