import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  User, 
  Video, 
  MapPin, 
  CheckCircle, 
  XCircle,
  Phone,
  FileText,
  RefreshCw,
  Calendar,
  AlertCircle
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Alert from '../../components/ui/Alert';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import doctorApi from '../../api/doctorApi';

const AppointmentQueue = ({ date = new Date().toISOString().split('T')[0] }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const statusFilters = [
    { value: 'all', label: 'All', count: 0 },
    { value: 'scheduled', label: 'Scheduled', count: 0 },
    { value: 'confirmed', label: 'Confirmed', count: 0 },
    { value: 'in-progress', label: 'In Progress', count: 0 },
    { value: 'completed', label: 'Completed', count: 0 },
  ];

  useEffect(() => {
    fetchAppointments();
    // Set up auto-refresh every 2 minutes
    const interval = setInterval(fetchAppointments, 120000);
    return () => clearInterval(interval);
  }, [date]);

  const fetchAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await doctorApi.getAppointmentsByDate(date);
      setAppointments(response.data || []);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const getStatusCounts = () => {
    const counts = {
      all: appointments.length,
      scheduled: 0,
      confirmed: 0,
      'in-progress': 0,
      completed: 0,
    };

    appointments.forEach((apt) => {
      if (counts[apt.status] !== undefined) {
        counts[apt.status]++;
      }
    });

    return counts;
  };

  const filteredAppointments = appointments.filter((apt) => {
    if (selectedFilter === 'all') return true;
    return apt.status === selectedFilter;
  }).sort((a, b) => {
    // Sort by time
    const timeA = a.time || '00:00';
    const timeB = b.time || '00:00';
    return timeA.localeCompare(timeB);
  });

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getStatusVariant = (status) => {
    const variants = {
      scheduled: 'info',
      confirmed: 'success',
      'in-progress': 'warning',
      completed: 'success',
      cancelled: 'danger',
    };
    return variants[status] || 'default';
  };

  const getStatusIcon = (status) => {
    const icons = {
      scheduled: Clock,
      confirmed: CheckCircle,
      'in-progress': AlertCircle,
      completed: CheckCircle,
      cancelled: XCircle,
    };
    const Icon = icons[status] || Clock;
    return <Icon className="h-4 w-4" />;
  };

  const handleStartConsultation = async (appointment) => {
    setActionLoading(true);
    try {
      await doctorApi.updateAppointmentStatus(appointment._id, 'in-progress');
      await fetchAppointments();
      
      // Navigate to video consultation if online
      if (appointment.appointmentType === 'online') {
        window.location.href = `/doctor/video-consultation/${appointment._id}`;
      }
    } catch (err) {
      console.error('Error starting consultation:', err);
      setError('Failed to start consultation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkComplete = async (appointment) => {
    setActionLoading(true);
    try {
      await doctorApi.updateAppointmentStatus(appointment._id, 'completed');
      await fetchAppointments();
    } catch (err) {
      console.error('Error marking complete:', err);
      setError('Failed to mark as complete');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  const handleCall = (phone) => {
    if (phone) {
      window.location.href = `tel:${phone}`;
    }
  };

  const getCurrentStatus = () => {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    
    return filteredAppointments.map((apt) => {
      const aptTime = apt.time || '00:00';
      const isUpcoming = aptTime > currentTime;
      const isPast = aptTime < currentTime;
      const isCurrent = Math.abs(new Date(`2000-01-01T${aptTime}`) - new Date(`2000-01-01T${currentTime}`)) < 1800000; // Within 30 min
      
      return { ...apt, isUpcoming, isPast, isCurrent };
    });
  };

  const statusCounts = getStatusCounts();
  const enhancedAppointments = getCurrentStatus();

  if (loading) {
    return <Spinner size="lg" text="Loading appointments..." fullScreen />;
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Clock className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Appointment Queue</h2>
              <p className="text-sm text-gray-600">
                {new Date(date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            onClick={fetchAppointments}
            loading={loading}
          >
            Refresh
          </Button>
        </div>

        {/* Alerts */}
        {error && (
          <Alert variant="error" closable onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setSelectedFilter(filter.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedFilter === filter.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {filter.label}
              <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-opacity-20 bg-current">
                {statusCounts[filter.value] || 0}
              </span>
            </button>
          ))}
        </div>

        {/* Appointments List */}
        {enhancedAppointments.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Appointments
              </h3>
              <p className="text-gray-600">
                {selectedFilter === 'all'
                  ? 'No appointments scheduled for this date'
                  : `No ${selectedFilter} appointments`}
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {enhancedAppointments.map((appointment) => (
              <Card
                key={appointment._id}
                className={`hover:shadow-lg transition-shadow ${
                  appointment.isCurrent ? 'ring-2 ring-indigo-500' : ''
                }`}
              >
                <div className="space-y-4">
                  {/* Header with Time and Status */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-indigo-100 rounded-lg">
                        <Clock className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {formatTime(appointment.time)}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {appointment.appointmentType === 'online' ? (
                            <span className="flex items-center space-x-1">
                              <Video className="h-4 w-4" />
                              <span>Online Consultation</span>
                            </span>
                          ) : (
                            <span className="flex items-center space-x-1">
                              <MapPin className="h-4 w-4" />
                              <span>In-Person Visit</span>
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {appointment.isCurrent && (
                        <Badge variant="warning" icon={AlertCircle}>
                          Now
                        </Badge>
                      )}
                      <Badge
                        variant={getStatusVariant(appointment.status)}
                        icon={getStatusIcon(appointment.status)}
                      >
                        {appointment.status.replace('-', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  {/* Patient Information */}
                  <div className="flex items-start space-x-4 pt-4 border-t border-gray-100">
                    <div className="flex-shrink-0">
                      {appointment.patient?.profilePicture ? (
                        <img
                          src={appointment.patient.profilePicture}
                          alt={appointment.patient.name}
                          className="h-12 w-12 rounded-full object-cover border-2 border-gray-200"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-6 w-6 text-gray-500" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900">
                        {appointment.patient?.name || 'Unknown Patient'}
                      </h4>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                        {appointment.patient?.age && (
                          <span>{appointment.patient.age} years</span>
                        )}
                        {appointment.patient?.gender && (
                          <span>{appointment.patient.gender}</span>
                        )}
                        {appointment.patient?.phone && (
                          <button
                            onClick={() => handleCall(appointment.patient.phone)}
                            className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-700"
                          >
                            <Phone className="h-3 w-3" />
                            <span>{appointment.patient.phone}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Reason for Visit */}
                  {appointment.reason && (
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-sm text-gray-500 mb-1">Reason for visit:</p>
                      <p className="text-sm text-gray-900">{appointment.reason}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex space-x-2">
                      {/* Start Consultation - Only for scheduled/confirmed */}
                      {(appointment.status === 'scheduled' ||
                        appointment.status === 'confirmed') && (
                        <Button
                          variant="primary"
                          size="sm"
                          icon={
                            appointment.appointmentType === 'online' ? Video : CheckCircle
                          }
                          onClick={() => handleStartConsultation(appointment)}
                          loading={actionLoading}
                        >
                          Start Consultation
                        </Button>
                      )}

                      {/* Mark Complete - Only for in-progress */}
                      {appointment.status === 'in-progress' && (
                        <Button
                          variant="success"
                          size="sm"
                          icon={CheckCircle}
                          onClick={() => handleMarkComplete(appointment)}
                          loading={actionLoading}
                        >
                          Mark Complete
                        </Button>
                      )}

                      {/* View Details */}
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={FileText}
                        onClick={() => handleViewDetails(appointment)}
                      >
                        View Details
                      </Button>

                      {/* Call Patient */}
                      {appointment.patient?.phone && (
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={Phone}
                          onClick={() => handleCall(appointment.patient.phone)}
                        >
                          Call
                        </Button>
                      )}
                    </div>

                    {/* Appointment ID */}
                    {appointment.appointmentId && (
                      <span className="text-xs text-gray-500">
                        ID: {appointment.appointmentId}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Appointment Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedAppointment(null);
        }}
        title="Appointment Details"
        size="lg"
      >
        {selectedAppointment && (
          <div className="space-y-6">
            {/* Patient Info */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Patient Information</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <span className="ml-2 text-gray-900 font-medium">
                    {selectedAppointment.patient?.name}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Age:</span>
                  <span className="ml-2 text-gray-900 font-medium">
                    {selectedAppointment.patient?.age} years
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Gender:</span>
                  <span className="ml-2 text-gray-900 font-medium">
                    {selectedAppointment.patient?.gender}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Phone:</span>
                  <span className="ml-2 text-gray-900 font-medium">
                    {selectedAppointment.patient?.phone}
                  </span>
                </div>
              </div>
            </div>

            {/* Appointment Info */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Appointment Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="text-gray-900 font-medium">
                    {formatTime(selectedAppointment.time)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="text-gray-900 font-medium">
                    {selectedAppointment.appointmentType === 'online'
                      ? 'Online Consultation'
                      : 'In-Person Visit'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <Badge variant={getStatusVariant(selectedAppointment.status)}>
                    {selectedAppointment.status.replace('-', ' ').toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Reason */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Reason for Visit</h3>
              <p className="text-sm text-gray-700 p-3 bg-gray-50 rounded-lg">
                {selectedAppointment.reason}
              </p>
            </div>

            {/* Notes */}
            {selectedAppointment.notes && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
                <p className="text-sm text-gray-700 p-3 bg-gray-50 rounded-lg">
                  {selectedAppointment.notes}
                </p>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedAppointment(null);
                }}
              >
                Close
              </Button>
              {(selectedAppointment.status === 'scheduled' ||
                selectedAppointment.status === 'confirmed') && (
                <Button
                  variant="primary"
                  icon={CheckCircle}
                  onClick={() => {
                    handleStartConsultation(selectedAppointment);
                    setShowDetailsModal(false);
                  }}
                  loading={actionLoading}
                >
                  Start Consultation
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default AppointmentQueue;
