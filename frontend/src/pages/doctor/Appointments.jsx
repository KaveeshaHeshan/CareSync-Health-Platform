import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  Video,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  RefreshCw,
  Download,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import doctorApi from '../../api/doctorApi';
import AppointmentQueue from '../../features/doctor/AppointmentQueue';

/**
 * DoctorAppointments Component
 * 
 * Full appointments management page for doctors
 * Includes calendar view, filtering, searching, and appointment actions
 * 
 * @component
 */
const DoctorAppointments = () => {
  const navigate = useNavigate();
  
  // State management
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState('day'); // 'day', 'week', 'month'
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch appointments
  useEffect(() => {
    fetchAppointments();
  }, [selectedDate, statusFilter]);

  // Apply search filter
  useEffect(() => {
    applyFilters();
  }, [appointments, searchQuery]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError('');
      
      const filters = {
        date: selectedDate,
        ...(statusFilter !== 'all' && { status: statusFilter.toUpperCase() }),
      };
      
      const response = await doctorApi.getAppointments(filters);
      setAppointments(response.data || []);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...appointments];
    
    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter((apt) => {
        const patientName = apt.patient?.name?.toLowerCase() || '';
        const reason = apt.reason?.toLowerCase() || '';
        const query = searchQuery.toLowerCase();
        return patientName.includes(query) || reason.includes(query);
      });
    }
    
    setFilteredAppointments(filtered);
  };

  // Date navigation
  const handlePreviousDay = () => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() - 1);
    setSelectedDate(currentDate.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() + 1);
    setSelectedDate(currentDate.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  // Status statistics
  const getStatusStats = () => {
    const stats = {
      all: appointments.length,
      scheduled: 0,
      confirmed: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
    };
    
    appointments.forEach((apt) => {
      const status = apt.status?.toLowerCase().replace('-', '_');
      if (stats[status] !== undefined) {
        stats[status]++;
      }
    });
    
    return stats;
  };

  const stats = getStatusStats();

  // Status filters
  const statusFilters = [
    { value: 'all', label: 'All', count: stats.all },
    { value: 'scheduled', label: 'Scheduled', count: stats.scheduled },
    { value: 'confirmed', label: 'Confirmed', count: stats.confirmed },
    { value: 'in_progress', label: 'In Progress', count: stats.in_progress },
    { value: 'completed', label: 'Completed', count: stats.completed },
    { value: 'cancelled', label: 'Cancelled', count: stats.cancelled },
  ];

  // Appointment actions
  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  const handleStartConsultation = async (appointment) => {
    try {
      setActionLoading(true);
      await doctorApi.updateAppointmentStatus(appointment.id, 'IN_PROGRESS');
      
      if (appointment.type === 'VIDEO' || appointment.appointmentType === 'online') {
        navigate(`/doctor/video-consultation/${appointment.id}`);
      } else {
        await fetchAppointments();
      }
    } catch (err) {
      console.error('Error starting consultation:', err);
      setError('Failed to start consultation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteAppointment = async (appointment) => {
    try {
      setActionLoading(true);
      await doctorApi.updateAppointmentStatus(appointment.id, 'COMPLETED');
      await fetchAppointments();
      setShowDetailsModal(false);
    } catch (err) {
      console.error('Error completing appointment:', err);
      setError('Failed to complete appointment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelAppointment = async () => {
    if (!selectedAppointment || !cancelReason.trim()) return;
    
    try {
      setActionLoading(true);
      await doctorApi.cancelAppointment(selectedAppointment.id, cancelReason);
      await fetchAppointments();
      setShowCancelModal(false);
      setShowDetailsModal(false);
      setCancelReason('');
      setSelectedAppointment(null);
    } catch (err) {
      console.error('Error canceling appointment:', err);
      setError('Failed to cancel appointment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCall = (phoneNumber) => {
    if (phoneNumber) {
      window.location.href = `tel:${phoneNumber}`;
    }
  };

  // Format time
  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      SCHEDULED: 'blue',
      CONFIRMED: 'green',
      IN_PROGRESS: 'yellow',
      COMPLETED: 'gray',
      CANCELLED: 'red',
    };
    return colors[status] || 'gray';
  };

  // Get status display text
  const getStatusText = (status) => {
    return status?.replace('_', ' ') || 'Unknown';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
            <p className="text-gray-600 mt-1">Manage your appointment schedule</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={fetchAppointments}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={() => navigate('/doctor/schedule')}>
              <Calendar className="w-4 h-4 mr-2" />
              Manage Schedule
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
        )}

        {/* Date Navigation */}
        <Card className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousDay}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <div className="text-center min-w-[200px]">
                <div className="flex items-center justify-center space-x-2">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    {formatDate(selectedDate)}
                  </h2>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextDay}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleToday}
              >
                Today
              </Button>
            </div>

            {/* Search */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search patients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Status Filters */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all
                ${
                  statusFilter === filter.value
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <span className="font-medium whitespace-nowrap">{filter.label}</span>
              <Badge
                variant={statusFilter === filter.value ? 'primary' : 'default'}
                className="ml-1"
              >
                {filter.count}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.all}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Confirmed</p>
              <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">In Progress</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.in_progress}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Completed</p>
              <p className="text-2xl font-bold text-gray-600">{stats.completed}</p>
            </div>
            <div className="bg-gray-100 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : filteredAppointments.length === 0 ? (
        <Card className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No appointments found
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery
              ? 'Try adjusting your search criteria'
              : 'No appointments scheduled for this date'}
          </p>
          <Button onClick={() => navigate('/doctor/schedule')}>
            Manage Your Schedule
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <Card
              key={appointment.id}
              className="hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start justify-between">
                {/* Left Section */}
                <div className="flex items-start space-x-4 flex-1">
                  {/* Time Badge */}
                  <div className="bg-indigo-100 text-indigo-700 rounded-lg px-4 py-3 text-center min-w-[90px]">
                    <Clock className="w-5 h-5 mx-auto mb-1" />
                    <p className="text-sm font-semibold">
                      {formatTime(appointment.time)}
                    </p>
                  </div>

                  {/* Patient & Appointment Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {appointment.patient?.name || 'Unknown Patient'}
                      </h3>
                      <Badge variant={getStatusColor(appointment.status)}>
                        {getStatusText(appointment.status)}
                      </Badge>
                      {appointment.appointmentType === 'online' && (
                        <Badge variant="info">
                          <Video className="w-3 h-3 mr-1" />
                          Online
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-gray-600 flex items-center">
                        <Users className="w-4 h-4 mr-2 text-gray-400" />
                        {appointment.type || 'General Consultation'}
                      </p>
                      {appointment.reason && (
                        <p className="text-sm text-gray-500">
                          <span className="font-medium">Reason:</span> {appointment.reason}
                        </p>
                      )}
                      {appointment.patient?.phone && (
                        <button
                          onClick={() => handleCall(appointment.patient.phone)}
                          className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center"
                        >
                          <Phone className="w-4 h-4 mr-1" />
                          {appointment.patient.phone}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Section - Actions */}
                <div className="flex flex-col space-y-2 ml-4">
                  {appointment.status === 'CONFIRMED' && (
                    <Button
                      size="sm"
                      onClick={() => handleStartConsultation(appointment)}
                      disabled={actionLoading}
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Start
                    </Button>
                  )}
                  {appointment.status === 'IN_PROGRESS' && (
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleCompleteAppointment(appointment)}
                      disabled={actionLoading}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Complete
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(appointment)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Details
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Appointment Details Modal */}
      {showDetailsModal && selectedAppointment && (
        <Modal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedAppointment(null);
          }}
          title="Appointment Details"
          size="lg"
        >
          <div className="space-y-6">
            {/* Patient Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Patient Information
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium text-gray-900">
                    {selectedAppointment.patient?.name || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium text-gray-900">
                    {selectedAppointment.patient?.phone || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium text-gray-900">
                    {selectedAppointment.patient?.email || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Appointment Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Appointment Details
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium text-gray-900">
                    {formatDate(selectedAppointment.date)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium text-gray-900">
                    {formatTime(selectedAppointment.time)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium text-gray-900">
                    {selectedAppointment.type || 'General'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <Badge variant={getStatusColor(selectedAppointment.status)}>
                    {getStatusText(selectedAppointment.status)}
                  </Badge>
                </div>
                {selectedAppointment.reason && (
                  <div className="pt-2 border-t border-gray-200">
                    <span className="text-gray-600 block mb-1">Reason:</span>
                    <p className="text-gray-900">{selectedAppointment.reason}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              {selectedAppointment.status === 'CONFIRMED' && (
                <Button
                  onClick={() => handleStartConsultation(selectedAppointment)}
                  disabled={actionLoading}
                >
                  <Video className="w-4 h-4 mr-2" />
                  Start Consultation
                </Button>
              )}
              {selectedAppointment.status === 'IN_PROGRESS' && (
                <Button
                  variant="success"
                  onClick={() => handleCompleteAppointment(selectedAppointment)}
                  disabled={actionLoading}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark as Complete
                </Button>
              )}
              {!['COMPLETED', 'CANCELLED'].includes(selectedAppointment.status) && (
                <Button
                  variant="danger"
                  onClick={() => {
                    setShowDetailsModal(false);
                    setShowCancelModal(true);
                  }}
                  disabled={actionLoading}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancel Appointment
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedAppointment(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Cancel Appointment Modal */}
      {showCancelModal && selectedAppointment && (
        <Modal
          isOpen={showCancelModal}
          onClose={() => {
            setShowCancelModal(false);
            setCancelReason('');
          }}
          title="Cancel Appointment"
        >
          <div className="space-y-4">
            <Alert variant="warning">
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </Alert>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cancellation Reason *
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please provide a reason for cancellation..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                }}
              >
                Keep Appointment
              </Button>
              <Button
                variant="danger"
                onClick={handleCancelAppointment}
                disabled={!cancelReason.trim() || actionLoading}
              >
                {actionLoading ? 'Canceling...' : 'Confirm Cancellation'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default DoctorAppointments;
