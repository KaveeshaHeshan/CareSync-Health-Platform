import React, { useState, useEffect } from 'react';
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
import { useAuth } from '../../hooks/useAuth';
import { formatDate } from '../../utils/formatters';
import appointmentApi from '../../api/appointmentApi';
import labApi from '../../api/labApi';

const HistoryPage = () => {
  const { user } = useAuth();
  const [filterType, setFilterType] = useState('All');
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ consultations: 0, labReports: 0, prescriptions: 0 });

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const [appointmentsRes, labResultsRes, prescriptionsRes] = await Promise.all([
        appointmentApi.getAppointments().catch(() => ({ data: [] })),
        labApi.getPatientResults().catch(() => ({ data: [] })),
        labApi.getMyPrescriptions().catch(() => ({ data: [] }))
      ]);

      const appointments = appointmentsRes.data || [];
      const labResults = labResultsRes.data || [];
      const prescriptions = prescriptionsRes.data || [];

      // Combine all records
      const allRecords = [
        ...appointments.map(apt => ({
          id: apt._id,
          date: apt.date,
          doctor: apt.doctor?.name || 'Unknown Doctor',
          specialty: apt.doctor?.specialization || 'General',
          type: 'Consultation',
          reason: apt.reason || 'General consultation',
          status: apt.status === 'completed' ? 'Completed' : 'Pending',
          attachment: false
        })),
        ...labResults.map(lab => ({
          id: lab._id,
          date: lab.createdAt || lab.date,
          doctor: 'Lab Services',
          specialty: lab.category || 'General',
          type: 'Lab Result',
          reason: lab.testName,
          status: 'Reviewed',
          attachment: !!lab.fileUrl
        })),
        ...prescriptions.map(rx => ({
          id: rx._id,
          date: rx.createdAt,
          doctor: rx.doctor?.name || 'Unknown Doctor',
          specialty: rx.doctor?.specialization || 'General',
          type: 'Prescription',
          reason: rx.diagnosis || 'Medical prescription',
          status: rx.status === 'filled' ? 'Completed' : 'Pending',
          attachment: false
        }))
      ];

      // Sort by date descending
      allRecords.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      setMedicalHistory(allRecords);
      setStats({
        consultations: appointments.length,
        labReports: labResults.length,
        prescriptions: prescriptions.length
      });
    } catch (error) {
      console.error('Failed to fetch medical history:', error);
    } finally {
      setLoading(false);
    }
  };

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
          <h3 className="text-2xl font-black text-indigo-900 mt-1">{stats.consultations}</h3>
        </div>
        <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Lab Reports</p>
          <h3 className="text-2xl font-black text-emerald-900 mt-1">{stats.labReports}</h3>
        </div>
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Digital Prescriptions</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.prescriptions}</h3>
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
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500">Loading medical history...</td>
                </tr>
              ) : medicalHistory.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500">No medical records found</td>
                </tr>
              ) : medicalHistory.map((record) => (
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