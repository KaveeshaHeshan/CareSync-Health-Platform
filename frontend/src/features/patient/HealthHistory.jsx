import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Plus, 
  Calendar, 
  Stethoscope, 
  Activity, 
  AlertCircle,
  Clock
} from 'lucide-react';

// Shared UI components
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import appointmentApi from '../../api/appointmentApi';

const HealthHistory = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await appointmentApi.getAppointments();
      // Transform appointments to history records
      const historyRecords = (response.data || []).map(apt => ({
        id: apt._id,
        category: 'Consultation',
        title: apt.reason || 'General Consultation',
        date: new Date(apt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        provider: apt.doctor?.name || 'Unknown Doctor',
        status: apt.status === 'completed' ? 'Completed' : apt.status === 'cancelled' ? 'Cancelled' : 'Scheduled',
        variant: apt.status === 'completed' ? 'success' : apt.status === 'cancelled' ? 'danger' : 'info',
        icon: Stethoscope,
      }));
      setRecords(historyRecords);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', 'Consultation', 'Diagnosis', 'Surgery', 'Immunization', 'Lab Results'];
  const filteredRecords = activeFilter === 'All' 
    ? records 
    : records.filter(r => r.category === activeFilter);

  return (
    <Card 
      title="Medical History" 
      subtitle="Your verified health records and past consultations"
      headerAction={
        <Button variant="primary" size="sm" icon={Plus}>
          Add Record
        </Button>
      }
    >
      {/* 1. Search and Filtering */}
      <div className="flex flex-col lg:flex-row gap-4 mb-10">
        <div className="flex-1">
          <Input 
            placeholder="Search diagnosis or doctor..." 
            icon={Search} 
            className="bg-slate-50 border-none" 
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap
                ${activeFilter === cat 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}
              `}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Timeline View */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Clock size={32} className="text-slate-300" />
          </div>
          <p className="text-slate-500 text-sm">Loading your medical history...</p>
        </div>
      ) : (
      <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-slate-100">
        {filteredRecords.map((item) => (
          <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
            
            {/* Timeline Indicator */}
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-50 text-slate-400 shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
              <item.icon size={16} />
            </div>

            {/* History Card */}
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-2xl border border-slate-100 bg-white hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50/40 transition-all cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">
                  {item.category}
                </span>
                <Badge variant={item.variant} size="sm">{item.status}</Badge>
              </div>
              
              <h4 className="font-bold text-slate-800 text-lg mb-2">{item.title}</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-slate-400" />
                  <span className="font-medium">{item.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Stethoscope size={14} className="text-slate-400" />
                  <span className="font-medium truncate">{item.provider}</span>
                </div>
              </div>

              {/* Action Link */}
              <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-indigo-600 font-bold text-xs group-hover:text-indigo-700">
                <span>View Full Summary</span>
                <FileText size={14} />
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Empty State */}
      {filteredRecords.length === 0 && (
        <div className="py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300 shadow-sm">
            <Clock size={32} />
          </div>
          <h3 className="text-slate-800 font-bold">No records found</h3>
          <p className="text-slate-500 text-sm mt-1">Try changing your filters or searching for a different term.</p>
        </div>
      )}
    </Card>
  );
};

export default HealthHistory;