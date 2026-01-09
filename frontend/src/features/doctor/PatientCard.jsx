import React from 'react';
import { 
  User, 
  Clock, 
  Activity, 
  FileText, 
  Video, 
  ChevronRight,
  Heart,
  Droplets
} from 'lucide-react';

// Relative imports based on feature-based architecture
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

const PatientCard = ({ patient }) => {
  // Mock data for fallback if props aren't provided
  const data = patient || {
    name: "Alexander Thompson",
    age: 42,
    gender: "Male",
    time: "10:30 AM",
    status: "Confirmed",
    reason: "Persistent chest tightness and shortness of breath during light exercise.",
    vitals: {
      bpm: 82,
      spO2: 96,
      bp: "135/85"
    }
  };

  return (
    <Card className="hover:shadow-xl hover:shadow-indigo-50/50 transition-all border-slate-100 group">
      <div className="flex flex-col gap-5">
        
        {/* 1. Header: Patient Info & Time */}
        <div className="flex justify-between items-start">
          <div className="flex gap-4">
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <User size={28} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800">{data.name}</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {data.gender} • {data.age} Years Old
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1.5 text-indigo-600 font-black text-sm mb-1">
              <Clock size={16} />
              {data.time}
            </div>
            <Badge variant="success" size="sm">{data.status}</Badge>
          </div>
        </div>

        {/* 2. Mini Vitals Grid */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
          <div className="flex flex-col items-center py-1">
            <Heart size={14} className="text-rose-500 mb-1" />
            <span className="text-xs font-black text-slate-700">{data.vitals.bpm}</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase">BPM</span>
          </div>
          <div className="flex flex-col items-center py-1 border-x border-slate-200">
            <Activity size={14} className="text-indigo-500 mb-1" />
            <span className="text-xs font-black text-slate-700">{data.vitals.bp}</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase">BP</span>
          </div>
          <div className="flex flex-col items-center py-1">
            <Droplets size={14} className="text-sky-500 mb-1" />
            <span className="text-xs font-black text-slate-700">{data.vitals.spO2}%</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase">SpO2</span>
          </div>
        </div>

        {/* 3. Reason for Visit */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
            <FileText size={14} />
            Chief Complaint
          </div>
          <p className="text-sm text-slate-600 leading-relaxed line-clamp-2 italic">
            "{data.reason}"
          </p>
        </div>

        {/* 4. Action Footer */}
        <div className="pt-4 border-t border-slate-50 flex gap-3">
          <Button variant="primary" className="flex-1 shadow-indigo-100" icon={Video}>
            Start Call
          </Button>
          <Button variant="ghost" className="px-3" icon={ChevronRight}>
            Details
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default PatientCard;