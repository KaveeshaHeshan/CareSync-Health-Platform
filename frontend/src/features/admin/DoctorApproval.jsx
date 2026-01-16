import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  UserX,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Award,
  Briefcase,
  FileText,
  RefreshCw,
  Filter,
  Clock,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Alert from '../../components/ui/Alert';
import Spinner from '../../components/ui/Spinner';
import FormTextarea from '../../components/forms/FormTextarea';
import adminApi from '../../api/adminApi';

const DoctorApproval = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  
  // Modals
  const [showViewModal, setShowViewModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  
  // Action state
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminApi.getAllUsers();
      // Filter only doctors
      const doctorUsers = (response.data || []).filter(
        (user) => user.role === 'DOCTOR'
      );
      setDoctors(doctorUsers);
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError('Failed to load doctor applications');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setShowViewModal(true);
  };

  const handleApproveClick = (doctor) => {
    setSelectedDoctor(doctor);
    setShowApproveModal(true);
  };

  const handleRejectClick = (doctor) => {
    setSelectedDoctor(doctor);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const confirmApprove = async () => {
    setActionLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await adminApi.approveDoctor(selectedDoctor._id);
      setSuccess(`Dr. ${selectedDoctor.name} has been approved successfully`);
      setShowApproveModal(false);
      fetchDoctors();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error approving doctor:', err);
      setError(err.response?.data?.message || 'Failed to approve doctor');
    } finally {
      setActionLoading(false);
    }
  };

  const confirmReject = async () => {
    if (!rejectionReason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    setActionLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await adminApi.rejectDoctor(selectedDoctor._id, {
        reason: rejectionReason,
      });
      setSuccess(`Dr. ${selectedDoctor.name}'s application has been rejected`);
      setShowRejectModal(false);
      fetchDoctors();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error rejecting doctor:', err);
      setError(err.response?.data?.message || 'Failed to reject doctor');
    } finally {
      setActionLoading(false);
    }
  };

  // Filter doctors
  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch =
      doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'pending' && !doctor.isApproved) ||
      (statusFilter === 'approved' && doctor.isApproved) ||
      (statusFilter === 'inactive' && !doctor.isActive);
    
    return matchesSearch && matchesStatus;
  });

  const getStats = () => {
    return {
      total: doctors.length,
      pending: doctors.filter((d) => !d.isApproved).length,
      approved: doctors.filter((d) => d.isApproved).length,
      inactive: doctors.filter((d) => !d.isActive).length,
    };
  };

  const stats = getStats();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return <Spinner size="lg" text="Loading doctor applications..." fullScreen />;
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <UserCheck className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                Doctor Approval
              </h2>
              <p className="text-sm text-gray-600">
                Review and approve doctor applications
              </p>
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            onClick={fetchDoctors}
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
        {success && (
          <Alert variant="success" closable onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Doctors</p>
                <h3 className="text-2xl font-bold text-blue-900">{stats.total}</h3>
              </div>
              <UserCheck className="h-8 w-8 text-blue-600" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Pending Approval</p>
                <h3 className="text-2xl font-bold text-orange-900">{stats.pending}</h3>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Approved</p>
                <h3 className="text-2xl font-bold text-green-900">{stats.approved}</h3>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Inactive</p>
                <h3 className="text-2xl font-bold text-gray-900">{stats.inactive}</h3>
              </div>
              <UserX className="h-8 w-8 text-gray-600" />
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or specialization..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="w-full md:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending Approval</option>
                  <option value="approved">Approved</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Results count */}
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Showing {filteredDoctors.length} doctor(s)</span>
              {(searchTerm || statusFilter !== 'pending') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('pending');
                  }}
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </Card>

        {/* Doctors List */}
        {filteredDoctors.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <UserCheck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Doctors Found
              </h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'pending'
                  ? 'Try adjusting your filters'
                  : 'No pending doctor applications at the moment'}
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredDoctors.map((doctor) => (
              <Card
                key={doctor._id}
                className={`hover:shadow-lg transition-shadow ${
                  !doctor.isApproved ? 'border-2 border-orange-200' : ''
                }`}
              >
                <div className="space-y-4">
                  {/* Doctor Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {doctor.profilePicture ? (
                        <img
                          src={doctor.profilePicture}
                          alt={doctor.name}
                          className="h-16 w-16 rounded-full object-cover border-2 border-gray-200"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-2xl text-blue-600 font-bold">
                            {doctor.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Dr. {doctor.name}
                        </h3>
                        {doctor.specialization && (
                          <p className="text-sm text-gray-600">
                            {doctor.specialization}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex flex-col space-y-1">
                      {doctor.isApproved ? (
                        <Badge variant="success" icon={CheckCircle}>
                          Approved
                        </Badge>
                      ) : (
                        <Badge variant="warning" icon={Clock}>
                          Pending
                        </Badge>
                      )}
                      {!doctor.isActive && (
                        <Badge variant="danger" icon={XCircle}>
                          Inactive
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Doctor Details */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                    {doctor.experience && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Briefcase className="h-4 w-4 text-gray-400" />
                        <span>{doctor.experience}</span>
                      </div>
                    )}
                    
                    {doctor.fees && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span>${doctor.fees} / session</span>
                      </div>
                    )}

                    {doctor.email && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="truncate">{doctor.email}</span>
                      </div>
                    )}

                    {doctor.phone && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{doctor.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Registration Date */}
                  <div className="flex items-center space-x-2 text-xs text-gray-500 pt-2 border-t border-gray-100">
                    <Calendar className="h-3 w-3" />
                    <span>Registered on {formatDate(doctor.createdAt)}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={Eye}
                      onClick={() => handleViewDoctor(doctor)}
                    >
                      View Details
                    </Button>

                    {!doctor.isApproved ? (
                      <div className="flex space-x-2">
                        <Button
                          variant="danger"
                          size="sm"
                          icon={XCircle}
                          onClick={() => handleRejectClick(doctor)}
                        >
                          Reject
                        </Button>
                        <Button
                          variant="success"
                          size="sm"
                          icon={CheckCircle}
                          onClick={() => handleApproveClick(doctor)}
                        >
                          Approve
                        </Button>
                      </div>
                    ) : (
                      <Badge variant="success">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Already Approved
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* View Doctor Details Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedDoctor(null);
        }}
        title="Doctor Application Details"
        size="lg"
      >
        {selectedDoctor && (
          <div className="space-y-6">
            {/* Doctor Profile */}
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              {selectedDoctor.profilePicture ? (
                <img
                  src={selectedDoctor.profilePicture}
                  alt={selectedDoctor.name}
                  className="h-20 w-20 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-3xl text-blue-600 font-bold">
                    {selectedDoctor.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900">
                  Dr. {selectedDoctor.name}
                </h3>
                {selectedDoctor.specialization && (
                  <p className="text-gray-600">{selectedDoctor.specialization}</p>
                )}
                <div className="flex items-center space-x-2 mt-2">
                  {selectedDoctor.isApproved ? (
                    <Badge variant="success">Approved</Badge>
                  ) : (
                    <Badge variant="warning">Pending Approval</Badge>
                  )}
                  {selectedDoctor.isActive ? (
                    <Badge variant="success">Active</Badge>
                  ) : (
                    <Badge variant="danger">Inactive</Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <FileText className="h-5 w-5 text-gray-600" />
                <span>Personal Information</span>
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <p className="text-sm text-gray-900">{selectedDoctor.email}</p>
                  </div>
                </div>

                {selectedDoctor.phone && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Phone</p>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <p className="text-sm text-gray-900">{selectedDoctor.phone}</p>
                    </div>
                  </div>
                )}

                {selectedDoctor.age && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Age</p>
                    <p className="text-sm text-gray-900">{selectedDoctor.age} years</p>
                  </div>
                )}

                {selectedDoctor.gender && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Gender</p>
                    <p className="text-sm text-gray-900">{selectedDoctor.gender}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-600 mb-1">Registration Date</p>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <p className="text-sm text-gray-900">
                      {formatDate(selectedDoctor.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <Award className="h-5 w-5 text-gray-600" />
                <span>Professional Details</span>
              </h4>
              <div className="grid grid-cols-2 gap-4">
                {selectedDoctor.specialization && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Specialization</p>
                    <p className="text-sm text-gray-900 font-medium">
                      {selectedDoctor.specialization}
                    </p>
                  </div>
                )}

                {selectedDoctor.experience && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Experience</p>
                    <div className="flex items-center space-x-2">
                      <Briefcase className="h-4 w-4 text-gray-400" />
                      <p className="text-sm text-gray-900">
                        {selectedDoctor.experience}
                      </p>
                    </div>
                  </div>
                )}

                {selectedDoctor.fees && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Consultation Fee</p>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <p className="text-sm text-gray-900 font-semibold">
                        ${selectedDoctor.fees}
                      </p>
                    </div>
                  </div>
                )}

                {selectedDoctor.rating !== undefined && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Rating</p>
                    <div className="flex items-center space-x-2">
                      <Award className="h-4 w-4 text-yellow-500" />
                      <p className="text-sm text-gray-900">
                        {selectedDoctor.rating.toFixed(1)} / 5.0
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedDoctor(null);
                }}
              >
                Close
              </Button>
              {!selectedDoctor.isApproved && (
                <>
                  <Button
                    variant="danger"
                    icon={XCircle}
                    onClick={() => {
                      setShowViewModal(false);
                      handleRejectClick(selectedDoctor);
                    }}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="success"
                    icon={CheckCircle}
                    onClick={() => {
                      setShowViewModal(false);
                      handleApproveClick(selectedDoctor);
                    }}
                  >
                    Approve
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Approve Confirmation Modal */}
      <Modal
        isOpen={showApproveModal}
        onClose={() => {
          setShowApproveModal(false);
          setSelectedDoctor(null);
        }}
        title="Approve Doctor"
        size="sm"
      >
        <div className="space-y-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-green-800 font-medium mb-1">
                  Approve Doctor Application
                </p>
                <p className="text-sm text-green-700">
                  Are you sure you want to approve{' '}
                  <strong>Dr. {selectedDoctor?.name}</strong> as a doctor on the
                  platform? They will be able to accept appointments and provide
                  consultations.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="secondary"
              onClick={() => {
                setShowApproveModal(false);
                setSelectedDoctor(null);
              }}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="success"
              icon={CheckCircle}
              onClick={confirmApprove}
              loading={actionLoading}
            >
              Approve Doctor
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Confirmation Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setSelectedDoctor(null);
          setRejectionReason('');
        }}
        title="Reject Doctor Application"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-50 rounded-lg">
            <div className="flex items-start space-x-3">
              <XCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-800 font-medium mb-1">
                  Reject Doctor Application
                </p>
                <p className="text-sm text-red-700">
                  You are about to reject <strong>Dr. {selectedDoctor?.name}</strong>
                  's application. Please provide a reason for rejection.
                </p>
              </div>
            </div>
          </div>

          <FormTextarea
            label="Reason for Rejection"
            placeholder="Explain why this application is being rejected..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={4}
            required
            helperText="This reason will be communicated to the applicant"
          />

          <div className="flex justify-end space-x-2">
            <Button
              variant="secondary"
              onClick={() => {
                setShowRejectModal(false);
                setSelectedDoctor(null);
                setRejectionReason('');
              }}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              icon={XCircle}
              onClick={confirmReject}
              loading={actionLoading}
              disabled={!rejectionReason.trim()}
            >
              Reject Application
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default DoctorApproval;
