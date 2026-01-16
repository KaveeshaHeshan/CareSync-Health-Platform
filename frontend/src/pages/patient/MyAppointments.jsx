import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  Filter,
  Search,
  X,
  ChevronRight,
  Phone,
  MessageSquare,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  MoreVertical,
  Edit,
  Trash2,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import appointmentApi from '../../api/appointmentApi';
import { formatDate, formatTime } from '../../utils/formatters';

/**
 * MyAppointments Component
 * 
 * Patient's appointment management page
 * Shows all appointments with filters, search, and actions
 * 
 * @component
 */
const MyAppointments = () => {
  const navigate = useNavigate();
  
  // State management
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  // Status tabs
  const statusTabs = [
    { id: 'all', label: 'All', count: 0 },
    { id: 'SCHEDULED', label: 'Upcoming', count: 0 },
    { id: 'COMPLETED', label: 'Completed', count: 0 },
    { id: 'CANCELLED', label: 'Cancelled', count: 0 },
  ];

  // Fetch appointments
  useEffect(() => {
    fetchAppointments();
  }, []);

  // Apply filters
  useEffect(() => {
    applyFilters();
  }, [appointments, searchQuery, statusFilter, typeFilter]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentApi.getPatientAppointments();
      setAppointments(response.appointments || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...appointments];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (apt) =>
          apt.doctorId?.name?.toLowerCase().includes(query) ||
          apt.doctorId?.specialization?.toLowerCase().includes(query) ||
          apt.reason?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((apt) => apt.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter((apt) => apt.type === typeFilter);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.dateTime || b.date) - new Date(a.dateTime || a.date));

    setFilteredAppointments(filtered);
  };

  const handleCancelAppointment = async () => {
    if (!cancelReason.trim()) {
      alert('Please provide a reason for cancellation');
      return;
    }

    try {
      setCancelling(true);
      await appointmentApi.cancelAppointment(selectedAppointment._id, {
        reason: cancelReason,
      });
      
      // Refresh appointments
      await fetchAppointments();
      
      // Close modal
      setShowCancelModal(false);
      setSelectedAppointment(null);
      setCancelReason('');
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      alert('Failed to cancel appointment. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'SCHEDULED':
      case 'CONFIRMED':
        return <Clock size={16} className="text-blue-600" />;
      case 'COMPLETED':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'CANCELLED':
        return <XCircle size={16} className="text-red-600" />;
      default:
        return <AlertCircle size={16} className="text-yellow-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SCHEDULED':
      case 'CONFIRMED':
        return 'blue';
      case 'COMPLETED':
        return 'green';
      case 'CANCELLED':
        return 'red';
      default:
        return 'yellow';
    }
  };

  const canJoinCall = (appointment) => {
    if (appointment.type !== 'online' || appointment.status === 'CANCELLED') {
      return false;
    }

    const appointmentTime = new Date(appointment.dateTime || appointment.date);
    const now = new Date();
    const diffMinutes = Math.floor((appointmentTime - now) / (1000 * 60));

    // Can join 15 minutes before to 60 minutes after
    return diffMinutes >= -60 && diffMinutes <= 15;
  };

  const canCancelAppointment = (appointment) => {
    if (appointment.status === 'CANCELLED' || appointment.status === 'COMPLETED') {
      return false;
    }

    const appointmentTime = new Date(appointment.dateTime || appointment.date);
    const now = new Date();
    const diffHours = Math.floor((appointmentTime - now) / (1000 * 60 * 60));

    // Can cancel at least 24 hours before
    return diffHours >= 24;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              My Appointments
            </h1>
            <p className="text-slate-600 mt-1">
              Manage your healthcare appointments
            </p>
          </div>
          <Button
            onClick={() => navigate('/patient/find-doctors')}
            className="gap-2"
          >
            <Calendar size={18} />
            Book New
          </Button>
        </div>

        {/* Filters Card */}
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search by doctor, specialization, or reason..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search size={18} />}
              />
            </div>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Types</option>
              <option value="online">Video Consultation</option>
              <option value="in-person">In-Person</option>
            </select>

            {/* Clear Filters */}
            {(searchQuery || statusFilter !== 'all' || typeFilter !== 'all') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setTypeFilter('all');
                }}
                className="gap-2"
              >
                <X size={18} />
                Clear
              </Button>
            )}
          </div>
        </Card>

        {/* Status Tabs */}
        <Card className="p-2">
          <div className="flex gap-2 overflow-x-auto">
            {statusTabs.map((tab) => {
              const count = tab.id === 'all'
                ? appointments.length
                : appointments.filter((apt) => apt.status === tab.id).length;

              return (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                    statusFilter === tab.id
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    statusFilter === tab.id
                      ? 'bg-white text-indigo-600'
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Appointments List */}
        {filteredAppointments.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Calendar size={32} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No Appointments Found
            </h3>
            <p className="text-slate-600 mb-6">
              {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Book your first appointment with a doctor'}
            </p>
            <Button onClick={() => navigate('/patient/find-doctors')}>
              <Calendar size={18} />
              Find Doctors
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <Card
                key={appointment._id}
                className="p-6 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Left - Doctor Info */}
                  <div className="flex items-start gap-4 flex-1">
                    {/* Avatar */}
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center text-white font-bold text-2xl shrink-0">
                      {appointment.doctorId?.name?.charAt(0) || 'D'}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-slate-900 mb-1">
                            Dr. {appointment.doctorId?.name || 'Unknown'}
                          </h3>
                          <p className="text-sm text-slate-600 mb-2">
                            {appointment.doctorId?.specialization || 'General Physician'}
                          </p>
                        </div>
                        <Badge color={getStatusColor(appointment.status)} className="gap-1">
                          {getStatusIcon(appointment.status)}
                          {appointment.status}
                        </Badge>
                      </div>

                      {/* Appointment Details */}
                      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar size={16} className="text-indigo-600" />
                          <span className="text-slate-700">
                            {formatDate(appointment.dateTime || appointment.date)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <Clock size={16} className="text-indigo-600" />
                          <span className="text-slate-700">
                            {appointment.time || formatTime(appointment.dateTime)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          {appointment.type === 'online' ? (
                            <Video size={16} className="text-indigo-600" />
                          ) : (
                            <MapPin size={16} className="text-indigo-600" />
                          )}
                          <span className="text-slate-700">
                            {appointment.type === 'online' ? 'Video Call' : 'In-Person'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <FileText size={16} className="text-indigo-600" />
                          <span className="text-slate-700 truncate">
                            {appointment.reason || 'General Checkup'}
                          </span>
                        </div>
                      </div>

                      {/* Reason */}
                      {appointment.reason && (
                        <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                          <strong>Reason:</strong> {appointment.reason}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right - Actions */}
                  <div className="flex lg:flex-col gap-2 justify-end">
                    {/* Join Call Button */}
                    {canJoinCall(appointment) && (
                      <Button
                        size="sm"
                        onClick={() => navigate(`/patient/video-consultation?appointmentId=${appointment._id}`)}
                        className="gap-2 whitespace-nowrap"
                      >
                        <Video size={16} />
                        Join Call
                      </Button>
                    )}

                    {/* Contact Doctor */}
                    {appointment.status === 'SCHEDULED' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 whitespace-nowrap"
                      >
                        <MessageSquare size={16} />
                        Contact
                      </Button>
                    )}

                    {/* View Details */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/patient/appointments/${appointment._id}`)}
                      className="gap-2 whitespace-nowrap"
                    >
                      <ChevronRight size={16} />
                      Details
                    </Button>

                    {/* Cancel Button */}
                    {canCancelAppointment(appointment) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          setShowCancelModal(true);
                        }}
                        className="gap-2 text-red-600 border-red-200 hover:bg-red-50 whitespace-nowrap"
                      >
                        <X size={16} />
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Cancel Modal */}
        <Modal
          isOpen={showCancelModal}
          onClose={() => {
            setShowCancelModal(false);
            setSelectedAppointment(null);
            setCancelReason('');
          }}
          title="Cancel Appointment"
        >
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <div className="flex gap-3">
                <AlertCircle size={20} className="text-yellow-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-yellow-800">
                    <strong>Cancellation Policy:</strong><br />
                    • Appointments must be cancelled at least 24 hours in advance<br />
                    • Refunds will be processed within 5-7 business days<br />
                    • Late cancellations may incur a fee
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Reason for Cancellation *
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please provide a reason for cancelling this appointment..."
                rows="4"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                disabled={cancelling}
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedAppointment(null);
                  setCancelReason('');
                }}
                disabled={cancelling}
                className="flex-1"
              >
                Keep Appointment
              </Button>
              <Button
                onClick={handleCancelAppointment}
                disabled={cancelling || !cancelReason.trim()}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default MyAppointments;
