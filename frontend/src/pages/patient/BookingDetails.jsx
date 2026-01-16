import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Video,
  MapPin,
  User,
  FileText,
  AlertCircle,
  DollarSign,
  Stethoscope,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { formatDate } from '../../utils/formatters';
import appointmentApi from '../../api/appointmentApi';

/**
 * BookingDetails Component
 * 
 * Appointment booking form with patient details and reason for visit
 * Final step before payment and confirmation
 * 
 * @component
 */
const BookingDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { doctor, date, time, type } = location.state || {};

  // Redirect if no booking data
  if (!doctor || !date || !time) {
    navigate('/patient/find-doctors');
    return null;
  }

  // Form state
  const [formData, setFormData] = useState({
    patientName: '',
    patientPhone: '',
    patientAge: '',
    reasonForVisit: '',
    symptoms: '',
    medicalHistory: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError('');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.patientName.trim()) {
      setError('Please enter patient name');
      return;
    }
    if (!formData.patientPhone.trim()) {
      setError('Please enter contact number');
      return;
    }
    if (!formData.patientAge) {
      setError('Please enter age');
      return;
    }
    if (!formData.reasonForVisit.trim()) {
      setError('Please enter reason for visit');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Create appointment
      const appointmentData = {
        doctorId: doctor._id,
        date: date,
        time: time,
        type: type,
        reason: formData.reasonForVisit,
        symptoms: formData.symptoms,
        medicalHistory: formData.medicalHistory,
        patientDetails: {
          name: formData.patientName,
          phone: formData.patientPhone,
          age: formData.patientAge,
        },
        amount: doctor.fees,
      };

      const response = await appointmentApi.createAppointment(appointmentData);

      // Navigate to confirmation page
      navigate('/patient/booking-confirmation', {
        state: {
          appointment: response.appointment,
          doctor: doctor,
        },
      });
    } catch (err) {
      console.error('Booking error:', err);
      setError(
        err.response?.data?.message ||
        'Failed to book appointment. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="gap-2"
        >
          <ArrowLeft size={18} />
          Back
        </Button>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Booking Details
          </h1>
          <p className="text-slate-600 mt-1">
            Complete your appointment information
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              {/* Error Alert */}
              {error && (
                <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800">
                  <AlertCircle size={20} className="shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Patient Information */}
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <User size={20} />
                    Patient Information
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="patientName" className="block text-sm font-medium text-slate-700 mb-2">
                        Full Name *
                      </label>
                      <Input
                        id="patientName"
                        name="patientName"
                        type="text"
                        placeholder="Enter patient name"
                        value={formData.patientName}
                        onChange={handleChange}
                        disabled={loading}
                        required
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="patientPhone" className="block text-sm font-medium text-slate-700 mb-2">
                          Contact Number *
                        </label>
                        <Input
                          id="patientPhone"
                          name="patientPhone"
                          type="tel"
                          placeholder="+1 (555) 123-4567"
                          value={formData.patientPhone}
                          onChange={handleChange}
                          disabled={loading}
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="patientAge" className="block text-sm font-medium text-slate-700 mb-2">
                          Age *
                        </label>
                        <Input
                          id="patientAge"
                          name="patientAge"
                          type="number"
                          placeholder="25"
                          value={formData.patientAge}
                          onChange={handleChange}
                          disabled={loading}
                          min="1"
                          max="120"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Medical Information */}
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <FileText size={20} />
                    Medical Information
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="reasonForVisit" className="block text-sm font-medium text-slate-700 mb-2">
                        Reason for Visit *
                      </label>
                      <Input
                        id="reasonForVisit"
                        name="reasonForVisit"
                        type="text"
                        placeholder="e.g., Regular checkup, Fever, Chest pain"
                        value={formData.reasonForVisit}
                        onChange={handleChange}
                        disabled={loading}
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="symptoms" className="block text-sm font-medium text-slate-700 mb-2">
                        Symptoms (Optional)
                      </label>
                      <textarea
                        id="symptoms"
                        name="symptoms"
                        rows="3"
                        placeholder="Describe your symptoms in detail..."
                        value={formData.symptoms}
                        onChange={handleChange}
                        disabled={loading}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none disabled:bg-slate-100 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label htmlFor="medicalHistory" className="block text-sm font-medium text-slate-700 mb-2">
                        Relevant Medical History (Optional)
                      </label>
                      <textarea
                        id="medicalHistory"
                        name="medicalHistory"
                        rows="3"
                        placeholder="Any allergies, current medications, past surgeries..."
                        value={formData.medicalHistory}
                        onChange={handleChange}
                        disabled={loading}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none disabled:bg-slate-100 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                {/* Important Note */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex gap-3">
                    <AlertCircle size={20} className="text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-semibold text-blue-900 mb-1">
                        Important Information
                      </h3>
                      <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                        <li>Please arrive 10 minutes early for in-person appointments</li>
                        <li>For video consultations, ensure stable internet connection</li>
                        <li>Have your medical records and prescriptions ready</li>
                        <li>Cancellations must be made 24 hours in advance</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(-1)}
                    disabled={loading}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? 'Processing...' : 'Proceed to Payment'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* Right Column - Summary */}
          <div>
            <Card className="p-6 sticky top-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">
                Appointment Summary
              </h2>

              {/* Doctor Info */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-200">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center text-white font-bold text-2xl shrink-0">
                  {doctor.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900">
                    Dr. {doctor.name}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {doctor.specialization}
                  </p>
                </div>
              </div>

              {/* Appointment Details */}
              <div className="space-y-4 mb-6 pb-6 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <Calendar size={18} className="text-indigo-600" />
                  <div className="flex-1">
                    <p className="text-xs text-slate-600">Date</p>
                    <p className="font-medium text-slate-900">
                      {formatDate(date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock size={18} className="text-indigo-600" />
                  <div className="flex-1">
                    <p className="text-xs text-slate-600">Time</p>
                    <p className="font-medium text-slate-900">{time}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {type === 'online' ? (
                    <Video size={18} className="text-indigo-600" />
                  ) : (
                    <MapPin size={18} className="text-indigo-600" />
                  )}
                  <div className="flex-1">
                    <p className="text-xs text-slate-600">Type</p>
                    <p className="font-medium text-slate-900">
                      {type === 'online' ? 'Video Consultation' : 'In-Person Visit'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Fee Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Consultation Fee</span>
                  <span className="font-medium text-slate-900">
                    ${doctor.fees || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Platform Fee</span>
                  <span className="font-medium text-slate-900">$5</span>
                </div>
                <div className="h-px bg-slate-200"></div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">Total</span>
                  <span className="text-2xl font-bold text-indigo-600">
                    ${(doctor.fees || 0) + 5}
                  </span>
                </div>
              </div>

              {/* Payment Note */}
              <div className="p-3 bg-green-50 rounded-xl">
                <p className="text-xs text-green-800">
                  <strong>Secure Payment:</strong> Your payment information is encrypted and secure
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;
