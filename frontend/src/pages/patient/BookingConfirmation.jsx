import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  Calendar,
  Clock,
  Video,
  MapPin,
  Mail,
  Phone,
  Download,
  Home,
  List,
  Sparkles,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { formatDate } from '../../utils/formatters';

/**
 * BookingConfirmation Component
 * 
 * Success page after appointment booking
 * Shows confirmation details and next steps
 * 
 * @component
 */
const BookingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { appointment, doctor } = location.state || {};

  // Redirect if no booking data
  useEffect(() => {
    if (!appointment || !doctor) {
      navigate('/patient/dashboard');
    }
  }, [appointment, doctor, navigate]);

  if (!appointment || !doctor) {
    return null;
  }

  // Confetti animation
  useEffect(() => {
    // Trigger confetti animation
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    document.body.appendChild(canvas);

    // Simple confetti effect
    setTimeout(() => {
      document.body.removeChild(canvas);
    }, 3000);
  }, []);

  const handleDownloadReceipt = () => {
    // In real app, generate and download PDF receipt
    alert('Receipt download feature coming soon!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Success Animation */}
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white mb-6 shadow-2xl animate-bounce">
            <CheckCircle size={48} />
          </div>
          
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            Appointment Confirmed! 🎉
          </h1>
          <p className="text-xl text-slate-600">
            Your appointment has been successfully booked
          </p>
        </div>

        {/* Confirmation Details Card */}
        <Card className="p-8">
          {/* Booking ID */}
          <div className="text-center mb-8 pb-8 border-b border-slate-200">
            <p className="text-sm text-slate-600 mb-2">Booking ID</p>
            <p className="text-2xl font-mono font-bold text-indigo-600">
              #{appointment._id?.slice(-8).toUpperCase() || 'XXXXXXXX'}
            </p>
          </div>

          {/* Doctor Info */}
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-slate-200">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center text-white font-bold text-3xl shrink-0">
              {doctor.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Dr. {doctor.name}
              </h2>
              <div className="flex items-center gap-2">
                <Badge color="indigo">
                  {doctor.specialization}
                </Badge>
                <Badge color="green">
                  Verified
                </Badge>
              </div>
            </div>
          </div>

          {/* Appointment Details */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
              <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                <Calendar size={24} className="text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Date</p>
                <p className="text-lg font-semibold text-slate-900">
                  {formatDate(appointment.date || appointment.dateTime)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                <Clock size={24} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Time</p>
                <p className="text-lg font-semibold text-slate-900">
                  {appointment.time || 'TBD'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                {appointment.type === 'online' ? (
                  <Video size={24} className="text-purple-600" />
                ) : (
                  <MapPin size={24} className="text-purple-600" />
                )}
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Type</p>
                <p className="text-lg font-semibold text-slate-900">
                  {appointment.type === 'online' ? 'Video Consultation' : 'In-Person Visit'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                <Sparkles size={24} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Status</p>
                <p className="text-lg font-semibold text-slate-900">
                  {appointment.status || 'Confirmed'}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Confirmation */}
          <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl mb-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Payment Status</p>
                <div className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-600" />
                  <p className="text-lg font-semibold text-green-700">
                    Payment Successful
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600 mb-1">Amount Paid</p>
                <p className="text-2xl font-bold text-slate-900">
                  ${(doctor.fees || 0) + 5}
                </p>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">
              What's Next?
            </h3>
            <div className="space-y-3">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold shrink-0">
                  1
                </div>
                <div>
                  <p className="font-medium text-slate-900 mb-1">
                    Check Your Email
                  </p>
                  <p className="text-sm text-slate-600">
                    We've sent a confirmation email with appointment details and instructions
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold shrink-0">
                  2
                </div>
                <div>
                  <p className="font-medium text-slate-900 mb-1">
                    Prepare for Your Appointment
                  </p>
                  <p className="text-sm text-slate-600">
                    {appointment.type === 'online' 
                      ? 'Ensure you have a stable internet connection and test your camera/microphone'
                      : 'Arrive 10 minutes early with any relevant medical records'}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold shrink-0">
                  3
                </div>
                <div>
                  <p className="font-medium text-slate-900 mb-1">
                    Join Your Appointment
                  </p>
                  <p className="text-sm text-slate-600">
                    {appointment.type === 'online'
                      ? 'Click the "Join Video Call" button from your appointments page'
                      : 'Visit CareSync Medical Center at the scheduled time'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="p-6 bg-slate-50 rounded-xl">
            <h3 className="font-semibold text-slate-900 mb-4">
              Need Help?
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-indigo-600" />
                <div>
                  <p className="text-xs text-slate-600">Email</p>
                  <p className="text-sm font-medium text-slate-900">
                    support@caresync.com
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={18} className="text-indigo-600" />
                <div>
                  <p className="text-xs text-slate-600">Phone</p>
                  <p className="text-sm font-medium text-slate-900">
                    +1 (555) 123-4567
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Button
            variant="outline"
            onClick={handleDownloadReceipt}
            className="gap-2"
          >
            <Download size={18} />
            Download Receipt
          </Button>
          
          <Button
            variant="outline"
            onClick={() => navigate('/patient/appointments')}
            className="gap-2"
          >
            <List size={18} />
            My Appointments
          </Button>
          
          <Button
            onClick={() => navigate('/patient/dashboard')}
            className="gap-2"
          >
            <Home size={18} />
            Go to Dashboard
          </Button>
        </div>

        {/* Additional Tips */}
        <Card className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <h3 className="text-xl font-semibold mb-3">
            💡 Pro Tips for Your Consultation
          </h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle size={16} className="shrink-0 mt-0.5" />
              <span>Write down your symptoms and questions beforehand</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={16} className="shrink-0 mt-0.5" />
              <span>Have your medical history and current medications list ready</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={16} className="shrink-0 mt-0.5" />
              <span>Take notes during the consultation for future reference</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={16} className="shrink-0 mt-0.5" />
              <span>Ask about follow-up appointments if needed</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default BookingConfirmation;
