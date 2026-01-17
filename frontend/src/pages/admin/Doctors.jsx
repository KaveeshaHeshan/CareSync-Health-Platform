import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Stethoscope,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Star,
  Award,
  DollarSign,
  Calendar,
  Users,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  RefreshCw,
  MoreVertical,
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
 * AdminDoctors Component
 * 
 * Comprehensive doctor management for administrators
 * Approve, reject, view, and manage all doctors
 * 
 * @component
 */
const AdminDoctors = () => {
  const navigate = useNavigate();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, pending, approved, rejected, active, inactive
  const [specializationFilter, setSpecializationFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [processing, setProcessing] = useState(false);
  
  // Modals
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Statistics
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    active: 0,
    inactive: 0,
  });

  // Specializations list
  const specializations = [
    'Cardiologist',
    'Dermatologist',
    'Pediatrician',
    'Neurologist',
    'Orthopedic',
    'Psychiatrist',
    'General Physician',
    'Gynecologist',
    'Ophthalmologist',
    'ENT Specialist',
  ];

  // Fetch doctors
  useEffect(() => {
    fetchDoctors();
  }, []);

  // Filter doctors
  useEffect(() => {
    filterDoctors();
  }, [doctors, searchTerm, statusFilter, specializationFilter]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await adminApi.getAllDoctors();
      
      if (response.data) {
        const doctorsData = response.data.doctors || [];
        setDoctors(doctorsData);
        calculateStatistics(doctorsData);
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError('Failed to load doctors. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterDoctors = () => {
    let filtered = [...doctors];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(doctor =>
        doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'pending') {
        filtered = filtered.filter(doctor => !doctor.isApproved && doctor.isActive);
      } else if (statusFilter === 'approved') {
        filtered = filtered.filter(doctor => doctor.isApproved);
      } else if (statusFilter === 'rejected') {
        filtered = filtered.filter(doctor => !doctor.isApproved && !doctor.isActive);
      } else if (statusFilter === 'active') {
        filtered = filtered.filter(doctor => doctor.isActive);
      } else if (statusFilter === 'inactive') {
        filtered = filtered.filter(doctor => !doctor.isActive);
      }
    }

    // Specialization filter
    if (specializationFilter !== 'all') {
      filtered = filtered.filter(doctor =>
        doctor.specialization === specializationFilter
      );
    }

    setFilteredDoctors(filtered);
    setCurrentPage(1);
  };

  const calculateStatistics = (data) => {
    const stats = {
      total: data.length,
      pending: data.filter(d => !d.isApproved && d.isActive).length,
      approved: data.filter(d => d.isApproved).length,
      rejected: data.filter(d => !d.isApproved && !d.isActive).length,
      active: data.filter(d => d.isActive).length,
      inactive: data.filter(d => !d.isActive).length,
    };
    setStatistics(stats);
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDoctors.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage);

  // Approve doctor
  const handleApproveDoctor = async () => {
    if (!selectedDoctor) return;

    try {
      setProcessing(true);
      setError('');
      
      await adminApi.approveDoctor(selectedDoctor._id);
      
      setSuccess(`Dr. ${selectedDoctor.name} has been approved successfully!`);
      setShowApprovalModal(false);
      setSelectedDoctor(null);
      await fetchDoctors();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error approving doctor:', err);
      setError('Failed to approve doctor');
    } finally {
      setProcessing(false);
    }
  };

  // Reject doctor
  const handleRejectDoctor = async () => {
    if (!selectedDoctor || !rejectionReason.trim()) {
      setError('Please provide a rejection reason');
      return;
    }

    try {
      setProcessing(true);
      setError('');
      
      await adminApi.rejectDoctor(selectedDoctor._id, {
        reason: rejectionReason
      });
      
      setSuccess(`Dr. ${selectedDoctor.name} has been rejected.`);
      setShowRejectModal(false);
      setSelectedDoctor(null);
      setRejectionReason('');
      await fetchDoctors();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error rejecting doctor:', err);
      setError('Failed to reject doctor');
    } finally {
      setProcessing(false);
    }
  };

  // Toggle doctor status
  const handleToggleStatus = async (doctorId, currentStatus) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    
    if (!window.confirm(`Are you sure you want to ${action} this doctor?`)) {
      return;
    }

    try {
      setProcessing(true);
      setError('');
      
      await adminApi.updateDoctorStatus(doctorId, { isActive: !currentStatus });
      
      setSuccess(`Doctor ${action}d successfully!`);
      await fetchDoctors();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating doctor status:', err);
      setError('Failed to update doctor status');
    } finally {
      setProcessing(false);
    }
  };

  // View doctor details
  const handleViewDetails = (doctor) => {
    setSelectedDoctor(doctor);
    setShowDetailModal(true);
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Specialization', 'Experience', 'Fees', 'Rating', 'Status', 'Approved'];
    const rows = filteredDoctors.map(doctor => [
      doctor.name,
      doctor.email,
      doctor.specialization,
      doctor.experience,
      doctor.fees,
      doctor.rating || 0,
      doctor.isActive ? 'Active' : 'Inactive',
      doctor.isApproved ? 'Yes' : 'No'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `doctors-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  // Get status badge
  const getStatusBadge = (doctor) => {
    if (!doctor.isApproved && doctor.isActive) {
      return <Badge variant="warning">Pending Approval</Badge>;
    } else if (doctor.isApproved && doctor.isActive) {
      return <Badge variant="success">Approved & Active</Badge>;
    } else if (!doctor.isActive) {
      return <Badge variant="danger">Inactive</Badge>;
    }
    return <Badge variant="gray">Unknown</Badge>;
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
            <h1 className="text-3xl font-bold text-gray-900">Doctors Management</h1>
            <p className="text-gray-600 mt-1">View, approve, and manage all doctors in the system</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={fetchDoctors}>
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <Card className="text-center">
            <p className="text-sm text-gray-600 mb-1">Total</p>
            <p className="text-2xl font-bold text-gray-900">{statistics.total}</p>
          </Card>
          <Card className="text-center">
            <p className="text-sm text-gray-600 mb-1">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{statistics.pending}</p>
          </Card>
          <Card className="text-center">
            <p className="text-sm text-gray-600 mb-1">Approved</p>
            <p className="text-2xl font-bold text-green-600">{statistics.approved}</p>
          </Card>
          <Card className="text-center">
            <p className="text-sm text-gray-600 mb-1">Rejected</p>
            <p className="text-2xl font-bold text-red-600">{statistics.rejected}</p>
          </Card>
          <Card className="text-center">
            <p className="text-sm text-gray-600 mb-1">Active</p>
            <p className="text-2xl font-bold text-blue-600">{statistics.active}</p>
          </Card>
          <Card className="text-center">
            <p className="text-sm text-gray-600 mb-1">Inactive</p>
            <p className="text-2xl font-bold text-gray-600">{statistics.inactive}</p>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search by name, email, specialization..."
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
              <option value="pending">Pending Approval</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Specialization Filter */}
          <div>
            <select
              value={specializationFilter}
              onChange={(e) => setSpecializationFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Specializations</option>
              {specializations.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Doctors Grid */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Doctors ({filteredDoctors.length})
        </h2>
      </div>

      {currentItems.length === 0 ? (
        <Card>
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Stethoscope className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-2">No doctors found</p>
            <p className="text-gray-500 text-sm">
              {searchTerm || statusFilter !== 'all' || specializationFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Doctors will appear here'}
            </p>
          </div>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {currentItems.map((doctor) => (
              <Card key={doctor._id} className="hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center mr-4">
                      <Stethoscope className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{doctor.name}</h3>
                      <p className="text-sm text-gray-600">{doctor.specialization}</p>
                    </div>
                  </div>
                  {getStatusBadge(doctor)}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    {doctor.email}
                  </div>
                  {doctor.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      {doctor.phone}
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-600">
                    <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
                    {doctor.experience} years experience
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                    {formatCurrency(doctor.fees)} consultation fee
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Star className="w-4 h-4 mr-2 text-yellow-400 fill-current" />
                    {doctor.rating || 0} rating ({doctor.totalReviews || 0} reviews)
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleViewDetails(doctor)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  
                  {!doctor.isApproved && doctor.isActive && (
                    <>
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setSelectedDoctor(doctor);
                          setShowApprovalModal(true);
                        }}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedDoctor(doctor);
                          setShowRejectModal(true);
                        }}
                      >
                        <XCircle className="w-4 h-4 text-red-500" />
                      </Button>
                    </>
                  )}
                  
                  {doctor.isApproved && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(doctor._id, doctor.isActive)}
                    >
                      {doctor.isActive ? (
                        <><UserX className="w-4 h-4 text-red-500" /></>
                      ) : (
                        <><UserCheck className="w-4 h-4 text-green-500" /></>
                      )}
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Card>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredDoctors.length)} of{' '}
                  {filteredDoctors.length} doctors
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
            </Card>
          )}
        </>
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedDoctor(null);
        }}
        title="Doctor Details"
      >
        {selectedDoctor && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b">
              <div className="flex items-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center mr-4">
                  <Stethoscope className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedDoctor.name}</h3>
                  <p className="text-gray-600">{selectedDoctor.specialization}</p>
                  <div className="flex items-center mt-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                    <span className="text-sm font-medium">{selectedDoctor.rating || 0}</span>
                    <span className="text-sm text-gray-500 ml-1">
                      ({selectedDoctor.totalReviews || 0} reviews)
                    </span>
                  </div>
                </div>
              </div>
              {getStatusBadge(selectedDoctor)}
            </div>

            {/* Contact Information */}
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-3">Contact Information</h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 text-gray-400 mr-3" />
                  <span className="text-sm text-gray-900">{selectedDoctor.email}</span>
                </div>
                {selectedDoctor.phone && (
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 text-gray-400 mr-3" />
                    <span className="text-sm text-gray-900">{selectedDoctor.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Professional Details */}
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-3">Professional Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Experience</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedDoctor.experience} years
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Consultation Fee</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatCurrency(selectedDoctor.fees)}
                  </p>
                </div>
                {selectedDoctor.qualification && (
                  <div className="bg-gray-50 rounded-lg p-3 col-span-2">
                    <p className="text-xs text-gray-500 mb-1">Qualification</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedDoctor.qualification}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* About */}
            {selectedDoctor.about && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">About</h4>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {selectedDoctor.about}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedDoctor(null);
                }}
              >
                Close
              </Button>
              {!selectedDoctor.isApproved && selectedDoctor.isActive && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowDetailModal(false);
                      setShowRejectModal(true);
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => {
                      setShowDetailModal(false);
                      setShowApprovalModal(true);
                    }}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Approval Modal */}
      <Modal
        isOpen={showApprovalModal}
        onClose={() => {
          setShowApprovalModal(false);
          setSelectedDoctor(null);
        }}
        title="Approve Doctor"
      >
        {selectedDoctor && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-3" />
                <div>
                  <h4 className="text-sm font-medium text-green-900 mb-1">
                    Approve Dr. {selectedDoctor.name}?
                  </h4>
                  <p className="text-sm text-green-700">
                    This will activate the doctor's account and allow them to accept appointments.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Specialization:</span>
                <span className="font-medium text-gray-900">{selectedDoctor.specialization}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Experience:</span>
                <span className="font-medium text-gray-900">{selectedDoctor.experience} years</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium text-gray-900">{selectedDoctor.email}</span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowApprovalModal(false);
                  setSelectedDoctor(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleApproveDoctor} disabled={processing}>
                {processing ? (
                  <Spinner size="sm" className="mr-2" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                Approve Doctor
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Rejection Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setSelectedDoctor(null);
          setRejectionReason('');
        }}
        title="Reject Doctor Application"
      >
        {selectedDoctor && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <XCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
                <div>
                  <h4 className="text-sm font-medium text-red-900 mb-1">
                    Reject Dr. {selectedDoctor.name}?
                  </h4>
                  <p className="text-sm text-red-700">
                    This will deactivate the doctor's account. Please provide a reason.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason *
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a reason for rejection..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRejectDoctor}
                disabled={processing || !rejectionReason.trim()}
                className="bg-red-600 hover:bg-red-700"
              >
                {processing ? (
                  <Spinner size="sm" className="mr-2" />
                ) : (
                  <XCircle className="w-4 h-4 mr-2" />
                )}
                Reject Application
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminDoctors;
