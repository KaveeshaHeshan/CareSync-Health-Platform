import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  User,
  Stethoscope,
  Video,
  MapPin,
  Phone,
  Mail,
  FileText,
  DollarSign,
  MoreVertical,
  RefreshCw,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import adminApi from '../../api/adminApi';

/**
 * AdminAppointments Component
 * 
 * Comprehensive appointment management for administrators
 * View, filter, search, and manage all appointments
 * 
 * @component
 */
const AdminAppointments = () => {
  const navigate = useNavigate();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, pending, confirmed, completed, cancelled
  const [typeFilter, setTypeFilter] = useState('all'); // all, online, in-person
  const [selectedDate, setSelectedDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Modals
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [processing, setProcessing] = useState(false);

  // Statistics
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    online: 0,
    inPerson: 0,
  });

  // Fetch appointments
  useEffect(() => {
    fetchAppointments();
  }, []);

  // Filter appointments
  useEffect(() => {
    filterAppointments();
  }, [appointments, searchTerm, statusFilter, typeFilter, selectedDate]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await adminApi.getAllAppointments();
      
      if (response.data) {
        const appointmentsData = response.data.appointments || [];
        setAppointments(appointmentsData);
        calculateStatistics(appointmentsData);
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    let filtered = [...appointments];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(appointment =>
        appointment.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.doctor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment._id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(appointment =>
        appointment.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(appointment =>
        appointment.type?.toLowerCase() === typeFilter.toLowerCase()
      );
    }

    // Date filter
    if (selectedDate) {
      filtered = filtered.filter(appointment => {
        const appointmentDate = new Date(appointment.date).toISOString().split('T')[0];
        return appointmentDate === selectedDate;
      });
    }

    setFilteredAppointments(filtered);
    setCurrentPage(1);
  };

  const calculateStatistics = (data) => {
    const stats = {
      total: data.length,
      pending: data.filter(a => a.status === 'pending').length,
      confirmed: data.filter(a => a.status === 'confirmed').length,
      completed: data.filter(a => a.status === 'completed').length,
      cancelled: data.filter(a => a.status === 'cancelled').length,
      online: data.filter(a => a.type === 'online').length,
      inPerson: data.filter(a => a.type === 'in-person').length,
    };
    setStatistics(stats);
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAppointments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);

  // Handle status change
  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      setProcessing(true);
      setError('');
      
      await adminApi.updateAppointmentStatus(appointmentId, newStatus);
      
      setSuccess(`Appointment ${newStatus} successfully!`);
      await fetchAppointments();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating appointment:', err);
      setError('Failed to update appointment status');
    } finally {
      setProcessing(false);
    }
  };

  // Handle cancel appointment
  const handleCancelAppointment = async () => {
    if (!cancelReason.trim()) {
      setError('Please provide a cancellation reason');
      return;
    }

    try {
      setProcessing(true);
      setError('');
      
      await adminApi.cancelAppointment(selectedAppointment._id, {
        reason: cancelReason,
        cancelledBy: 'admin'
      });
      
      setSuccess('Appointment cancelled successfully!');
      setShowCancelModal(false);
      setCancelReason('');
      setSelectedAppointment(null);
      await fetchAppointments();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      setError('Failed to cancel appointment');
    } finally {
      setProcessing(false);
    }
  };

  // Handle delete appointment
  const handleDeleteAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to delete this appointment? This action cannot be undone.')) {
      return;
    }

    try {
      setProcessing(true);
      setError('');
      
      await adminApi.deleteAppointment(appointmentId);
      
      setSuccess('Appointment deleted successfully!');
      await fetchAppointments();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting appointment:', err);
      setError('Failed to delete appointment');
    } finally {
      setProcessing(false);
    }
  };

  // View appointment details
  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailModal(true);
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Patient', 'Doctor', 'Date', 'Time', 'Type', 'Status', 'Amount'];
    const rows = filteredAppointments.map(appointment => [
      appointment._id,
      appointment.patient?.name || 'N/A',
      appointment.doctor?.name || 'N/A',
      formatDate(appointment.date),
      appointment.time,
      appointment.type,
      appointment.status,
      appointment.amount || 0
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `appointments-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  // Get status badge variant
  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'confirmed':
        return 'info';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'danger';
      default:
        return 'gray';
    }
  };

  // Get type badge variant
  const getTypeVariant = (type) => {
    return type === 'online' ? 'info' : 'gray';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Appointments Management</h1>
            <p className="text-gray-600 mt-1">View and manage all appointments in the system</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={fetchAppointments}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={handleExportCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <Alert variant="error" className="mb-4" onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert variant="success" className="mb-4" onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          <Card className="text-center">
            <p className="text-sm text-gray-600 mb-1">Total</p>
            <p className="text-2xl font-bold text-gray-900">{statistics.total}</p>
          </Card>
          <Card className="text-center">
            <p className="text-sm text-gray-600 mb-1">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{statistics.pending}</p>
          </Card>
          <Card className="text-center">
            <p className="text-sm text-gray-600 mb-1">Confirmed</p>
            <p className="text-2xl font-bold text-blue-600">{statistics.confirmed}</p>
          </Card>
          <Card className="text-center">
            <p className="text-sm text-gray-600 mb-1">Completed</p>
            <p className="text-2xl font-bold text-green-600">{statistics.completed}</p>
          </Card>
          <Card className="text-center">
            <p className="text-sm text-gray-600 mb-1">Cancelled</p>
            <p className="text-2xl font-bold text-red-600">{statistics.cancelled}</p>
          </Card>
          <Card className="text-center">
            <p className="text-sm text-gray-600 mb-1">Online</p>
            <p className="text-2xl font-bold text-purple-600">{statistics.online}</p>
          </Card>
          <Card className="text-center">
            <p className="text-sm text-gray-600 mb-1">In-Person</p>
            <p className="text-2xl font-bold text-indigo-600">{statistics.inPerson}</p>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search by patient, doctor, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="online">Online</option>
              <option value="in-person">In-Person</option>
            </select>
          </div>
        </div>

        {/* Date Filter */}
        <div className="mt-4">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="max-w-xs"
          />
          {selectedDate && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDate('')}
              className="ml-2"
            >
              Clear Date
            </Button>
          )}
        </div>
      </Card>

      {/* Appointments Table */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Appointments ({filteredAppointments.length})
          </h2>
        </div>

        {currentItems.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-2">No appointments found</p>
            <p className="text-gray-500 text-sm">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || selectedDate
                ? 'Try adjusting your filters'
                : 'Appointments will appear here'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentItems.map((appointment) => (
                    <tr key={appointment._id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm text-gray-500 font-mono">
                        {appointment._id?.slice(-8)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {appointment.patient?.name || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {appointment.patient?.email || ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                            <Stethoscope className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {appointment.doctor?.name || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {appointment.doctor?.specialization || ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900">{formatDate(appointment.date)}</div>
                        <div className="text-sm text-gray-500">{appointment.time}</div>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant={getTypeVariant(appointment.type)}>
                          {appointment.type === 'online' ? (
                            <><Video className="w-3 h-3 mr-1 inline" />Online</>
                          ) : (
                            <><MapPin className="w-3 h-3 mr-1 inline" />In-Person</>
                          )}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant={getStatusVariant(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">
                        {formatCurrency(appointment.amount)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(appointment)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedAppointment(appointment);
                                setShowCancelModal(true);
                              }}
                            >
                              <XCircle className="w-4 h-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t">
                <div className="text-sm text-gray-600">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredAppointments.length)} of{' '}
                  {filteredAppointments.length} appointments
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedAppointment(null);
        }}
        title="Appointment Details"
      >
        {selectedAppointment && (
          <div className="space-y-6">
            {/* Status Badge */}
            <div className="flex items-center justify-between pb-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Appointment #{selectedAppointment._id?.slice(-8)}
              </h3>
              <Badge variant={getStatusVariant(selectedAppointment.status)} className="text-base">
                {selectedAppointment.status}
              </Badge>
            </div>

            {/* Patient Info */}
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-3">Patient Information</h4>
              <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                <div className="flex items-center">
                  <User className="w-4 h-4 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-gray-900">
                    {selectedAppointment.patient?.name}
                  </span>
                </div>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 text-blue-600 mr-2" />
                  <span className="text-sm text-gray-600">
                    {selectedAppointment.patient?.email}
                  </span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 text-blue-600 mr-2" />
                  <span className="text-sm text-gray-600">
                    {selectedAppointment.patient?.phone || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Doctor Info */}
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-3">Doctor Information</h4>
              <div className="bg-green-50 rounded-lg p-4 space-y-2">
                <div className="flex items-center">
                  <Stethoscope className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-gray-900">
                    {selectedAppointment.doctor?.name}
                  </span>
                </div>
                <div className="flex items-center">
                  <FileText className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-sm text-gray-600">
                    {selectedAppointment.doctor?.specialization}
                  </span>
                </div>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-sm text-gray-600">
                    {selectedAppointment.doctor?.email}
                  </span>
                </div>
              </div>
            </div>

            {/* Appointment Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Date</p>
                <p className="text-sm text-gray-900">{formatDate(selectedAppointment.date)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Time</p>
                <p className="text-sm text-gray-900">{selectedAppointment.time}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Type</p>
                <Badge variant={getTypeVariant(selectedAppointment.type)}>
                  {selectedAppointment.type}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Amount</p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatCurrency(selectedAppointment.amount)}
                </p>
              </div>
            </div>

            {/* Reason */}
            {selectedAppointment.reason && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Reason for Visit</h4>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {selectedAppointment.reason}
                </p>
              </div>
            )}

            {/* Notes */}
            {selectedAppointment.notes && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Notes</h4>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {selectedAppointment.notes}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedAppointment(null);
                }}
              >
                Close
              </Button>
              {selectedAppointment.status === 'pending' && (
                <Button
                  onClick={() => handleStatusChange(selectedAppointment._id, 'confirmed')}
                  disabled={processing}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirm
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

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
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-yellow-900 mb-1">
                  Are you sure you want to cancel this appointment?
                </h4>
                <p className="text-sm text-yellow-700">
                  This action will notify both the patient and doctor.
                </p>
              </div>
            </div>
          </div>

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
              Go Back
            </Button>
            <Button
              onClick={handleCancelAppointment}
              disabled={processing || !cancelReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {processing ? <Spinner size="sm" className="mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
              Cancel Appointment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminAppointments;
