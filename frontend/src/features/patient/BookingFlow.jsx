import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Video, MapPin, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import FormInput from '../../components/forms/FormInput';
import FormTextarea from '../../components/forms/FormTextarea';
import FormSelect from '../../components/forms/FormSelect';
import Alert from '../../components/ui/Alert';
import appointmentApi from '../../api/appointmentApi';

const BookingFlow = ({ doctor, onSuccess }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [bookingData, setBookingData] = useState({
    doctorId: doctor?._id || '',
    appointmentType: 'in-person',
    date: '',
    time: '',
    reason: '',
    symptoms: '',
    medicalHistory: '',
  });

  const steps = [
    { number: 1, title: 'Appointment Type', icon: Video },
    { number: 2, title: 'Date & Time', icon: Calendar },
    { number: 3, title: 'Details', icon: Check },
    { number: 4, title: 'Confirm', icon: Check },
  ];

  const appointmentTypeOptions = [
    { value: 'in-person', label: 'In-Person Consultation' },
    { value: 'online', label: 'Online Video Consultation' },
  ];

  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
    '05:00 PM', '05:30 PM', '06:00 PM',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookingData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return bookingData.appointmentType !== '';
      case 2:
        return bookingData.date !== '' && bookingData.time !== '';
      case 3:
        return bookingData.reason.trim() !== '';
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setError('');
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    } else {
      setError('Please complete all required fields');
    }
  };

  const handleBack = () => {
    setError('');
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const appointmentPayload = {
        doctor: bookingData.doctorId,
        date: bookingData.date,
        time: bookingData.time,
        type: bookingData.appointmentType,
        reason: bookingData.reason,
        notes: `Symptoms: ${bookingData.symptoms}\nMedical History: ${bookingData.medicalHistory}`,
      };

      const response = await appointmentApi.create(appointmentPayload);
      
      if (onSuccess) {
        onSuccess(response);
      } else {
        navigate('/patient/appointments');
      }
    } catch (error) {
      console.error('Booking error:', error);
      setError(
        error.response?.data?.message || 
        'Failed to book appointment. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={step.number}>
          <div className="flex flex-col items-center flex-1">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${
                currentStep >= step.number
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {currentStep > step.number ? (
                <Check className="h-5 w-5" />
              ) : (
                <span>{step.number}</span>
              )}
            </div>
            <span
              className={`text-xs text-center ${
                currentStep >= step.number ? 'text-indigo-600 font-medium' : 'text-gray-500'
              }`}
            >
              {step.title}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`h-0.5 flex-1 mx-2 transition-colors ${
                currentStep > step.number ? 'bg-indigo-600' : 'bg-gray-200'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900">
        Select Appointment Type
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {appointmentTypeOptions.map((option) => (
          <button
            key={option.value}
            onClick={() =>
              setBookingData((prev) => ({ ...prev, appointmentType: option.value }))
            }
            className={`p-6 rounded-lg border-2 transition-all text-left ${
              bookingData.appointmentType === option.value
                ? 'border-indigo-600 bg-indigo-50'
                : 'border-gray-200 hover:border-indigo-300'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div
                className={`p-2 rounded-lg ${
                  bookingData.appointmentType === option.value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {option.value === 'online' ? (
                  <Video className="h-6 w-6" />
                ) : (
                  <MapPin className="h-6 w-6" />
                )}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{option.label}</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {option.value === 'online'
                    ? 'Connect with your doctor via video call from anywhere'
                    : 'Visit the clinic for a face-to-face consultation'}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900">
        Choose Date & Time
      </h3>

      <FormInput
        id="date"
        name="date"
        type="date"
        label="Select Date"
        value={bookingData.date}
        onChange={handleChange}
        min={new Date().toISOString().split('T')[0]}
        icon={Calendar}
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Time Slot <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
          {timeSlots.map((slot) => (
            <button
              key={slot}
              onClick={() => setBookingData((prev) => ({ ...prev, time: slot }))}
              className={`p-2 rounded-lg border transition-all text-sm ${
                bookingData.time === slot
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-medium'
                  : 'border-gray-200 hover:border-indigo-300'
              }`}
            >
              {slot}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900">
        Appointment Details
      </h3>

      <FormTextarea
        id="reason"
        name="reason"
        label="Reason for Visit"
        placeholder="Brief description of your health concern"
        value={bookingData.reason}
        onChange={handleChange}
        rows={3}
        maxLength={500}
        showCharCount
        required
      />

      <FormTextarea
        id="symptoms"
        name="symptoms"
        label="Current Symptoms"
        placeholder="Describe your current symptoms"
        value={bookingData.symptoms}
        onChange={handleChange}
        rows={3}
        helperText="This helps the doctor prepare for your consultation"
      />

      <FormTextarea
        id="medicalHistory"
        name="medicalHistory"
        label="Relevant Medical History"
        placeholder="Any previous conditions, medications, or allergies"
        value={bookingData.medicalHistory}
        onChange={handleChange}
        rows={3}
        helperText="Optional but recommended"
      />
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        Confirm Your Appointment
      </h3>

      <Card className="bg-gray-50">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-gray-900">Doctor</h4>
              <p className="text-gray-700">{doctor?.name}</p>
              <p className="text-sm text-gray-600">{doctor?.specialization}</p>
            </div>
            {doctor?.fees && (
              <div className="text-right">
                <p className="text-sm text-gray-600">Consultation Fee</p>
                <p className="text-lg font-semibold text-gray-900">${doctor.fees}</p>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 pt-4 space-y-3">
            <div className="flex items-center space-x-2 text-gray-700">
              {bookingData.appointmentType === 'online' ? (
                <Video className="h-5 w-5 text-indigo-600" />
              ) : (
                <MapPin className="h-5 w-5 text-indigo-600" />
              )}
              <span>
                {bookingData.appointmentType === 'online'
                  ? 'Online Video Consultation'
                  : 'In-Person Consultation'}
              </span>
            </div>

            <div className="flex items-center space-x-2 text-gray-700">
              <Calendar className="h-5 w-5 text-indigo-600" />
              <span>{new Date(bookingData.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}</span>
            </div>

            <div className="flex items-center space-x-2 text-gray-700">
              <Clock className="h-5 w-5 text-indigo-600" />
              <span>{bookingData.time}</span>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h5 className="font-medium text-gray-900 mb-2">Reason for Visit</h5>
            <p className="text-gray-700">{bookingData.reason}</p>
          </div>
        </div>
      </Card>

      <Alert variant="info">
        You will receive a confirmation email and SMS once your appointment is confirmed.
      </Alert>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        {renderStepIndicator()}

        {error && (
          <Alert variant="error" className="mb-6" closable onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <div className="min-h-[400px]">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </div>

        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          {currentStep > 1 && (
            <Button
              variant="secondary"
              onClick={handleBack}
              icon={ChevronLeft}
              iconPosition="left"
            >
              Back
            </Button>
          )}

          {currentStep < 4 ? (
            <Button
              variant="primary"
              onClick={handleNext}
              icon={ChevronRight}
              iconPosition="right"
              className="ml-auto"
            >
              Next
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={loading}
              className="ml-auto"
            >
              {loading ? 'Booking...' : 'Confirm Appointment'}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default BookingFlow;
