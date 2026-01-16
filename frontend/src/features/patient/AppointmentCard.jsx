import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Video, 
  MapPin, 
  User, 
  Phone, 
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit2,
  Trash2,
  MoreVertical
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Alert from '../../components/ui/Alert';
import appointmentApi from '../../api/appointmentApi';

const AppointmentCard = ({ appointment, onUpdate, onCancel, onReschedule }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getStatusVariant = (status) => {
    const variants = {
      scheduled: 'info',
      confirmed: 'success',
      completed: 'success',
      cancelled: 'danger',
      'no-show': 'warning',
    };
    return variants[status] || 'default';
  };

  const getStatusIcon = (status) => {
    const icons = {
      scheduled: Clock,
      confirmed: CheckCircle,
      completed: CheckCircle,
      cancelled: XCircle,
      'no-show': AlertCircle,
    };
    const Icon = icons[status] || Clock;
    return <Icon className="h-4 w-4" />;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const isUpcoming = () => {
    const appointmentDate = new Date(appointment.date);
    const now = new Date();
    return appointmentDate > now && appointment.status === 'scheduled';
  };

  const canJoinVideo = () => {
    if (appointment.appointmentType !== 'online') return false;
    if (appointment.status !== 'scheduled' && appointment.status !== 'confirmed') return false;
    
    const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);
    const now = new Date();
    const diffMinutes = (appointmentDateTime - now) / (1000 * 60);
    
    // Allow joining 15 minutes before and up to 30 minutes after scheduled time
    return diffMinutes <= 15 && diffMinutes >= -30;
  };

  const handleCancelAppointment = async () => {
    if (!cancelReason.trim()) {
      setError('Please provide a reason for cancellation');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await appointmentApi.cancelAppointment(appointment._id, { reason: cancelReason });
      setShowCancelModal(false);
      if (onCancel) onCancel(appointment._id);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      setError(err.response?.data?.message || 'Failed to cancel appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinVideo = () => {
    if (appointment.videoRoomUrl) {
      window.open(appointment.videoRoomUrl, '_blank');
    } else {
      // Navigate to video consultation page
      window.location.href = `/patient/consultation/${appointment._id}`;
    }
  };

  const handleReschedule = () => {
    setShowMenu(false);
    if (onReschedule) onReschedule(appointment);
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow relative">
        {/* Status Badge - Top Right */}
        <div className="absolute top-4 right-4">
          <Badge variant={getStatusVariant(appointment.status)} icon={getStatusIcon(appointment.status)}>
            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
          </Badge>
        </div>

        <div className="space-y-4">
          {/* Doctor Information */}
          <div className="flex items-start space-x-4 pr-24">
            <div className="flex-shrink-0">
              {appointment.doctor?.profilePicture ? (
                <img
                  src={appointment.doctor.profilePicture}
                  alt={appointment.doctor.name}
                  className="h-16 w-16 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center border-2 border-gray-200">
                  <User className="h-8 w-8 text-indigo-600" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                Dr. {appointment.doctor?.name || 'Unknown Doctor'}
              </h3>
              <p className="text-sm text-gray-600">
                {appointment.doctor?.specialization || 'General Practice'}
              </p>
              {appointment.doctor?.email && (
                <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
                  <Mail className="h-3 w-3" />
                  <span>{appointment.doctor.email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Appointment Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-gray-100">
            {/* Date */}
            <div className="flex items-center space-x-2 text-sm">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-gray-700">{formatDate(appointment.date)}</span>
            </div>

            {/* Time */}
            <div className="flex items-center space-x-2 text-sm">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-gray-700">{formatTime(appointment.time)}</span>
            </div>

            {/* Type */}
            <div className="flex items-center space-x-2 text-sm">
              {appointment.appointmentType === 'online' ? (
                <>
                  <Video className="h-4 w-4 text-blue-500" />
                  <span className="text-gray-700">Online Consultation</span>
                </>
              ) : (
                <>
                  <MapPin className="h-4 w-4 text-green-500" />
                  <span className="text-gray-700">In-Person Visit</span>
                </>
              )}
            </div>

            {/* Fees */}
            {appointment.fees && (
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-gray-500">Fee:</span>
                <span className="font-semibold text-gray-900">${appointment.fees}</span>
              </div>
            )}
          </div>

          {/* Reason for Visit */}
          {appointment.reason && (
            <div className="pt-3 border-t border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Reason for visit:</p>
              <p className="text-sm text-gray-700">{appointment.reason}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex space-x-2">
              {/* Join Video Call Button - Only for online appointments */}
              {canJoinVideo() && (
                <Button
                  variant="primary"
                  size="sm"
                  icon={Video}
                  onClick={handleJoinVideo}
                >
                  Join Video Call
                </Button>
              )}

              {/* Reschedule Button - Only for upcoming appointments */}
              {isUpcoming() && (
                <Button
                  variant="secondary"
                  size="sm"
                  icon={Edit2}
                  onClick={handleReschedule}
                >
                  Reschedule
                </Button>
              )}

              {/* Cancel Button - Only for upcoming appointments */}
              {isUpcoming() && (
                <Button
                  variant="danger"
                  size="sm"
                  icon={XCircle}
                  onClick={() => setShowCancelModal(true)}
                >
                  Cancel
                </Button>
              )}

              {/* View Details Button */}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  window.location.href = `/patient/appointments/${appointment._id}`;
                }}
              >
                View Details
              </Button>
            </div>

            {/* More Options Menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <MoreVertical className="h-5 w-5" />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          window.location.href = `/patient/appointments/${appointment._id}`;
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        View Details
                      </button>
                      {appointment.doctor?.phone && (
                        <button
                          onClick={() => {
                            setShowMenu(false);
                            window.location.href = `tel:${appointment.doctor.phone}`;
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Phone className="h-4 w-4 inline mr-2" />
                          Call Doctor
                        </button>
                      )}
                      {isUpcoming() && (
                        <>
                          <button
                            onClick={handleReschedule}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Edit2 className="h-4 w-4 inline mr-2" />
                            Reschedule
                          </button>
                          <button
                            onClick={() => {
                              setShowMenu(false);
                              setShowCancelModal(true);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4 inline mr-2" />
                            Cancel Appointment
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Cancel Appointment Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setCancelReason('');
          setError('');
        }}
        title="Cancel Appointment"
        size="md"
      >
        <div className="space-y-4">
          {error && (
            <Alert variant="error" closable onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <Alert variant="warning">
            <p className="text-sm">
              Are you sure you want to cancel this appointment with Dr. {appointment.doctor?.name}?
              This action cannot be undone.
            </p>
          </Alert>

          <div className="space-y-2">
            <label htmlFor="cancelReason" className="block text-sm font-medium text-gray-700">
              Reason for Cancellation <span className="text-red-500">*</span>
            </label>
            <textarea
              id="cancelReason"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Please provide a reason for cancelling this appointment"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setShowCancelModal(false);
                setCancelReason('');
                setError('');
              }}
              disabled={loading}
            >
              Keep Appointment
            </Button>
            <Button
              variant="danger"
              onClick={handleCancelAppointment}
              loading={loading}
              disabled={!cancelReason.trim()}
            >
              Cancel Appointment
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AppointmentCard;
