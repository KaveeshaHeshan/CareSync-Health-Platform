import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { 
  Stethoscope, 
  Calendar as CalendarIcon, 
  Clock, 
  FileText, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

// Relative imports based on your folder structure
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import FormSelect from '../../components/forms/FormSelect';
import FormInput from '../../components/forms/FormInput';
import appointmentApi from '../../api/appointmentApi';
import adminApi from '../../api/adminApi';

const BookingFlow = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);

  const { register, watch, trigger, formState: { errors }, getValues } = useForm({
    mode: 'onChange'
  });

  const watchedDate = watch('date');

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (watchedDate && selectedDoctor) {
      fetchAvailableSlots(selectedDoctor, watchedDate);
    }
  }, [watchedDate, selectedDoctor]);

  const fetchDoctors = async () => {
    try {
      const response = await adminApi.getDoctors();
      const doctorsList = response.data || [];
      setDoctors(doctorsList);
      
      // Create specialties list from doctors
      const uniqueSpecializations = [...new Set(doctorsList.map(d => d.specialization).filter(Boolean))];
      const specialtiesOptions = uniqueSpecializations.map(spec => ({
        value: spec.toLowerCase().replace(/\s+/g, '-'),
        label: spec,
        doctors: doctorsList.filter(d => d.specialization === spec)
      }));
      
      setSpecialties(specialtiesOptions);
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
    }
  };

  const fetchAvailableSlots = async (doctorId, date) => {
    try {
      const response = await appointmentApi.getAvailableSlots(doctorId, date);
      setAvailableSlots(response.availableSlots || []);
    } catch (error) {
      console.error('Failed to fetch slots:', error);
      setAvailableSlots([]);
    }
  };

  const handleSpecialtyChange = (e) => {
    const selectedSpec = specialties.find(s => s.value === e.target.value);
    if (selectedSpec && selectedSpec.doctors && selectedSpec.doctors.length > 0) {
      // Select the first doctor from this specialty
      setSelectedDoctor(selectedSpec.doctors[0]._id);
    }
  };

  // Navigation Logic
  const nextStep = async () => {
    // Validate current step before proceeding
    if (step === 1) {
      if (!selectedDoctor) {
        alert('Please select a specialty');
        return;
      }
      setStep(s => s + 1);
    } else if (step === 2) {
      const formData = getValues();
      if (!formData.date) {
        alert('Please select a date');
        return;
      }
      if (!selectedSlot) {
        alert('Please select a time slot');
        return;
      }
      setStep(s => s + 1);
    } else {
      setStep(s => s + 1);
    }
  };

  const prevStep = () => setStep(s => s - 1);

  const handleFinalSubmit = async () => {
    if (!selectedDoctor) {
      alert('Please select a specialty');
      return;
    }
    if (!selectedSlot) {
      alert('Please select a time slot');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const formData = getValues();
      
      if (!formData.date) {
        alert('Please select a date');
        return;
      }
      
      const appointmentData = {
        doctorId: selectedDoctor,
        date: formData.date,
        time: selectedSlot,
        reason: formData.notes || 'General consultation',
        type: 'in-person'
      };
      
      console.log('Booking appointment with data:', appointmentData);
      await appointmentApi.bookAppointment(appointmentData);
      setIsSuccess(true);
    } catch (err) {
      console.error('Booking failed', err);
      alert('Failed to book appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className="max-w-xl mx-auto text-center py-12 animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <CheckCircle2 size={40} />
        </div>
        <h2 className="text-2xl font-black text-slate-800">Booking Confirmed!</h2>
        <p className="text-slate-500 mt-2">Your appointment request has been sent to the clinic. You will receive a confirmation via email shortly.</p>
        <div className="flex gap-4 justify-center mt-8">
          <Button variant="secondary" onClick={() => navigate('/patient/history')}>
            View My Appointments
          </Button>
          <Button variant="primary" onClick={() => navigate('/patient/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4">
      {/* 1. Step Indicator */}
      <div className="flex items-center justify-between mb-10 px-2">
        {[1, 2, 3].map((i) => (
          <React.Fragment key={i}>
            <div className={`
              flex items-center justify-center w-10 h-10 rounded-full font-bold transition-all duration-300
              ${step >= i ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-200 text-slate-500'}
            `}>
              {i}
            </div>
            {i < 3 && (
              <div className={`flex-1 h-1 mx-4 rounded-full transition-colors duration-500 ${step > i ? 'bg-indigo-600' : 'bg-slate-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* 2. Flow Content */}
      <Card 
        title={step === 1 ? "Choose Specialty" : step === 2 ? "Select Schedule" : "Visit Details"}
        subtitle={`Step ${step} of 3`}
      >
        <div className="min-h-75">
          {/* STEP 1: Provider Selection */}
          {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
              <FormSelect 
                label="What do you need help with?"
                name="specialty"
                placeholder="Choose a medical department"
                icon={Stethoscope}
                options={specialties}
                register={register}
                errors={errors}
                onChange={handleSpecialtyChange}
              />
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex gap-4">
                <AlertCircle className="text-indigo-500 shrink-0" size={20} />
                <p className="text-xs text-slate-500 leading-relaxed">
                  CareSync will automatically match you with the highest-rated available specialist in this department.
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: Date & Time */}
          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
              <FormInput 
                label="Preferred Date"
                name="date"
                type="date"
                icon={CalendarIcon}
                register={register}
                errors={errors}
              />
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700 ml-1 flex items-center gap-2">
                  <Clock size={16} className="text-slate-400" />
                  Available Time Slots {selectedSlot && <span className="text-indigo-600">- Selected: {selectedSlot}</span>}
                </label>
                {availableSlots.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">Please select a date to see available slots</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {availableSlots.map(time => (
                      <button 
                        key={time} 
                        type="button"
                        onClick={() => setSelectedSlot(time)}
                        className={`py-3 px-2 text-xs font-bold border-2 rounded-xl transition-all ${
                          selectedSlot === time
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                            : 'border-slate-100 hover:border-indigo-600 hover:text-indigo-600 hover:bg-indigo-50'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Reason & Notes */}
          {step === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Reason for consultation</label>
                <textarea 
                  className="w-full h-32 p-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-4 focus:ring-indigo-600/10 outline-none transition-all resize-none"
                  placeholder="Describe your symptoms (e.g., persistent headache for 3 days)..."
                  {...register('notes')}
                ></textarea>
              </div>
              <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex gap-3">
                <FileText className="text-amber-600 shrink-0" size={20} />
                <span className="text-xs text-amber-800 leading-tight">
                  For emergencies, please call your local emergency services immediately instead of booking online.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 3. Navigation Controls */}
        <div className="flex gap-4 mt-12 pt-6 border-t border-slate-50">
          {step > 1 && (
            <Button variant="ghost" className="flex-1" onClick={prevStep} icon={ChevronLeft}>
              Back
            </Button>
          )}
          
          {step < 3 ? (
            <Button variant="primary" className="flex-1" onClick={nextStep} icon={ChevronRight}>
              Next Step
            </Button>
          ) : (
            <Button 
              variant="primary" 
              className="flex-1" 
              onClick={handleFinalSubmit}
              isLoading={isSubmitting}
            >
              Confirm Appointment
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default BookingFlow;