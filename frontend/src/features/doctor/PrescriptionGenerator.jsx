import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  FileText, 
  Send, 
  Printer, 
  Pill, 
  Clock, 
  AlertCircle 
} from 'lucide-react';

// Relative imports based on your established architecture
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import FormInput from '../../components/shared/FormInput';
import FormSelect from '../../components/shared/FormSelect';

const PrescriptionGenerator = ({ patientName = "Alexander Thompson" }) => {
  const [medications, setMedications] = useState([
    { id: 1, name: '', dosage: '', frequency: '', duration: '' }
  ]);
  const [isIssuing, setIsIssuing] = useState(false);

  const addMedication = () => {
    setMedications([
      ...medications,
      { id: Date.now(), name: '', dosage: '', frequency: '', duration: '' }
    ]);
  };

  const removeMedication = (id) => {
    if (medications.length > 1) {
      setMedications(medications.filter(med => med.id !== id));
    }
  };

  const handleIssue = async () => {
    setIsIssuing(true);
    // Simulate API call to save and send prescription to patient/pharmacy
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsIssuing(false);
    alert("Prescription issued successfully!");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <Card 
        title="Digital Prescription" 
        subtitle={`Issuing for: ${patientName}`}
        headerAction={
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" icon={Printer}>Print</Button>
            <Button 
              variant="primary" 
              size="sm" 
              icon={Send} 
              onClick={handleIssue}
              isLoading={isIssuing}
            >
              Issue & Send
            </Button>
          </div>
        }
      >
        {/* 1. Header Info (Clinic/Doctor Details) */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-6 mb-6">
          <div className="space-y-1">
            <h3 className="font-black text-slate-800 text-xl tracking-tight">CareSync General Hospital</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Medical Center ID: #CS-9902</p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-sm font-bold text-slate-700">Dr. Sarah Johnson</p>
            <p className="text-xs text-slate-500">Cardiology Specialist</p>
          </div>
        </div>

        {/* 2. Medication Entry List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Pill size={16} className="text-indigo-600" />
              Prescribed Medications
            </h4>
            <Button 
              variant="ghost" 
              size="sm" 
              icon={Plus} 
              onClick={addMedication}
              className="text-indigo-600 hover:bg-indigo-50"
            >
              Add Drug
            </Button>
          </div>

          <div className="space-y-3">
            {medications.map((med, index) => (
              <div 
                key={med.id} 
                className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 relative group animate-in slide-in-from-top-2"
              >
                <div className="md:col-span-4">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Medication Name</label>
                  <input 
                    className="w-full bg-white border-none rounded-xl text-sm p-2.5 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                    placeholder="e.g. Amoxicillin"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Dosage</label>
                  <input 
                    className="w-full bg-white border-none rounded-xl text-sm p-2.5 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                    placeholder="500mg"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Frequency</label>
                  <select className="w-full bg-white border-none rounded-xl text-sm p-2.5 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all">
                    <option>Once daily</option>
                    <option>Twice daily (12h)</option>
                    <option>Thrice daily (8h)</option>
                    <option>Before bed</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Duration</label>
                  <input 
                    className="w-full bg-white border-none rounded-xl text-sm p-2.5 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                    placeholder="7 days"
                  />
                </div>
                <div className="md:col-span-1 flex items-end justify-center pb-1">
                  <button 
                    onClick={() => removeMedication(med.id)}
                    className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Additional Instructions */}
        <div className="mt-8 space-y-3">
          <label className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <FileText size={16} className="text-indigo-600" />
            Advice & Notes
          </label>
          <textarea 
            className="w-full h-24 p-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-4 focus:ring-indigo-600/10 outline-none transition-all resize-none"
            placeholder="e.g. Take with food. Avoid alcohol while on this medication."
          ></textarea>
        </div>

        {/* 4. Safety Disclaimer */}
        <div className="mt-6 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
          <AlertCircle className="text-amber-600 shrink-0" size={20} />
          <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
            <strong>Medical Safety Check:</strong> Please ensure there are no known allergies to the prescribed drugs. This digital prescription is legally binding and will be transmitted to the patient's CareSync mobile app and preferred pharmacy.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default PrescriptionGenerator;