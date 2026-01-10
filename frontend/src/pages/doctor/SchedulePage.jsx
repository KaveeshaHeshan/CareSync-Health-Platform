import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  Calendar as CalendarIcon,
  MoreVertical,
  Settings2
} from 'lucide-react';

// Logic & Tools
import { useUIStore } from '../../store/useUIStore';
import { formatDate } from '../../utils/formatters';
import appointmentApi from '../../api/appointmentApi';

const SchedulePage = () => {
  const openModal = useUIStore((state) => state.openModal);
  const [viewType, setViewType] = useState('Week');
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    fetchSchedule();
  }, [selectedDate]);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const response = await appointmentApi.getAppointments();
      const appointments = response.data || [];
      
      // Transform appointments to time slots
      const slots = appointments.map(apt => ({
        time: apt.time,
        status: apt.status === 'confirmed' ? 'Booked' : apt.status === 'cancelled' ? 'Blocked' : 'Available',
        patient: apt.patient?.name || null,
        appointmentId: apt._id
      }));
      
      setTimeSlots(slots);
    } catch (error) {
      console.error('Failed to fetch schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* 1. Page Header & Actions */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Manage Schedule</h1>
          <p className="text-slate-500 mt-1">Define your availability and manage appointment windows.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => openModal('ADD_AVAILABILITY')}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2"
          >
            <Plus size={18} /> Add Slots
          </button>
          <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50">
            <Settings2 size={20} />
          </button>
        </div>
      </header>

      {/* 2. Calendar Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            {['Day', 'Week', 'Month'].map((type) => (
              <button
                key={type}
                onClick={() => setViewType(type)}
                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${
                  viewType === type ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          <h3 className="text-lg font-bold text-slate-900 ml-2">
            {formatDate(new Date(), 'full')}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400"><ChevronLeft size={20} /></button>
          <button className="px-4 py-1.5 text-sm font-bold text-slate-600 border border-slate-200 rounded-lg">Today</button>
          <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400"><ChevronRight size={20} /></button>
        </div>
      </div>

      {/* 3. Daily Schedule Grid */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading schedule...</div>
        ) : timeSlots.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No appointments scheduled</div>
        ) : timeSlots.map((slot, index) => (
          <div 
            key={index} 
            className={`group p-4 rounded-2xl border transition-all flex items-center justify-between ${
              slot.status === 'Booked' ? 'bg-white border-slate-100' : 
              slot.status === 'Blocked' ? 'bg-slate-50 border-slate-200 grayscale' : 
              'bg-indigo-50/30 border-dashed border-indigo-200'
            }`}
          >
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center min-w-[80px]">
                <Clock size={18} className={slot.status === 'Available' ? 'text-indigo-400' : 'text-slate-400'} />
                <span className="text-sm font-black text-slate-900 mt-1">{slot.time}</span>
              </div>

              <div className="h-10 w-[2px] bg-slate-100 rounded-full" />

              <div>
                {slot.status === 'Booked' ? (
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Patient Visit</span>
                    <span className="text-base font-bold text-slate-900">{slot.patient}</span>
                  </div>
                ) : slot.status === 'Blocked' ? (
                  <span className="text-sm font-bold text-slate-400 italic">{slot.patient}</span>
                ) : (
                  <span className="text-sm font-bold text-indigo-400 uppercase tracking-widest">Available Slot</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {slot.status === 'Available' ? (
                <button className="text-xs font-black text-indigo-600 px-3 py-1.5 bg-indigo-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  Block Time
                </button>
              ) : (
                <button className="p-2 text-slate-400 hover:text-slate-900 rounded-lg transition-colors">
                  <MoreVertical size={18} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SchedulePage;