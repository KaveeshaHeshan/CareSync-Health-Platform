import React, { useState } from 'react';
import { 
  Clock, 
  Calendar, 
  Plus, 
  Trash2, 
  Save, 
  Copy, 
  CheckCircle2,
  AlertCircle 
} from 'lucide-react';

// Relative imports based on feature-based architecture
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import NotificationToast from '../../components/shared/NotificationToast';

const SlotManager = () => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Initial mock state for availability
  const [availability, setAvailability] = useState({
    'Monday': ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'],
    'Tuesday': ['09:00 AM', '10:00 AM', '11:00 AM'],
    'Wednesday': ['01:00 PM', '02:00 PM', '03:30 PM', '04:30 PM'],
    'Thursday': ['09:00 AM', '10:30 AM', '02:00 PM'],
    'Friday': ['10:00 AM', '11:00 AM', '12:00 PM'],
    'Saturday': [],
    'Sunday': []
  });

  const removeSlot = (day, time) => {
    setAvailability(prev => ({
      ...prev,
      [day]: prev[day].filter(t => t !== time)
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call to update doctor schedule
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    setShowToast(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {showToast && (
        <NotificationToast 
          type="success"
          message="Schedule Updated"
          description="Your availability has been synced with the patient booking system."
          onClose={() => setShowToast(false)}
        />
      )}

      <Card 
        title="Availability Manager" 
        subtitle="Configure your weekly consultation windows"
        headerAction={
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" icon={Copy} className="hidden md:flex">
              Clone Schedule
            </Button>
            <Button 
              variant="primary" 
              size="sm" 
              icon={Save} 
              onClick={handleSave}
              isLoading={isSaving}
            >
              Save Changes
            </Button>
          </div>
        }
      >
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 1. Day Selector Sidebar */}
          <div className="w-full lg:w-56 space-y-2">
            {days.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`w-full px-5 py-3 rounded-2xl text-sm font-bold text-left transition-all flex items-center justify-between group
                  ${selectedDay === day 
                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' 
                    : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'}
                `}
              >
                {day}
                <Badge 
                  variant={availability[day].length > 0 ? 'success' : 'neutral'} 
                  size="sm"
                  className={selectedDay === day ? 'bg-white/20 text-white' : ''}
                >
                  {availability[day].length}
                </Badge>
              </button>
            ))}
          </div>

          {/* 2. Slot Configuration Area */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Calendar size={20} />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-lg">{selectedDay}</h3>
                  <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">Managing Active Slots</p>
                </div>
              </div>
              <Button variant="outline" size="sm" icon={Plus}>
                Add Time
              </Button>
            </div>

            {availability[selectedDay].length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {availability[selectedDay].map((time) => (
                  <div 
                    key={time} 
                    className="group relative p-4 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center gap-3 hover:border-indigo-600 hover:shadow-lg hover:shadow-indigo-50/50 transition-all cursor-default"
                  >
                    <Clock size={16} className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
                    <span className="text-sm font-black text-slate-700">{time}</span>
                    <button 
                      onClick={() => removeSlot(selectedDay, time)}
                      className="absolute -top-2 -right-2 w-7 h-7 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-110 active:scale-90"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-center">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300 shadow-sm">
                  <AlertCircle size={32} />
                </div>
                <h4 className="text-slate-800 font-bold text-lg">No Availability Set</h4>
                <p className="text-slate-500 text-sm max-w-xs mx-auto mt-2">
                  Patients won't be able to book consultations with you on {selectedDay}.
                </p>
                <Button variant="primary" size="sm" className="mt-6" icon={Plus}>
                  Define First Slot
                </Button>
              </div>
            )}

            {/* Quick Template Tools */}
            <div className="mt-12 p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100/50">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="text-indigo-600" size={18} />
                <h4 className="text-sm font-bold text-indigo-900">Standard Templates</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {['Full Day (9-5)', 'Morning (9-12)', 'Afternoon (1-4)'].map(template => (
                  <button 
                    key={template}
                    className="px-4 py-2 bg-white border border-indigo-100 rounded-xl text-xs font-bold text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                  >
                    Apply {template}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SlotManager;