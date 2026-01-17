import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Eye,
  FileText,
  Activity,
  ChevronRight,
  UserPlus,
  Download,
  TrendingUp,
  Clock,
  Heart,
  AlertCircle,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import doctorApi from '../../api/doctorApi';

/**
 * DoctorPatients Component
 * 
 * Patient management page for doctors
 * Shows all patients, their history, and allows viewing detailed records
 * 
 * @component
 */
const DoctorPatients = () => {
  const navigate = useNavigate();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, inactive
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [patientHistory, setPatientHistory] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalPatients: 0,
    activePatients: 0,
    newThisMonth: 0,
    averageVisits: 0,
  });

  // Fetch patients
  useEffect(() => {
    fetchPatients();
  }, []);

  // Apply filters
  useEffect(() => {
    applyFilters();
  }, [patients, searchQuery, filterStatus]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await doctorApi.getPatients();
      const patientData = response.data || response.patients || [];
      setPatients(patientData);
      
      // Calculate statistics
      calculateStats(patientData);
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError('Failed to load patients. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const now = new Date();
    const thisMonth = data.filter(p => {
      const createdDate = new Date(p.createdAt);
      return createdDate.getMonth() === now.getMonth() && 
             createdDate.getFullYear() === now.getFullYear();
    });

    const activePatients = data.filter(p => {
      // Consider active if they have an appointment in the last 3 months
      const lastVisit = p.lastVisit ? new Date(p.lastVisit) : null;
      if (!lastVisit) return false;
      const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      return lastVisit >= threeMonthsAgo;
    });

    const totalVisits = data.reduce((sum, p) => sum + (p.visitCount || 0), 0);
    const averageVisits = data.length > 0 ? Math.round(totalVisits / data.length) : 0;

    setStats({
      totalPatients: data.length,
      activePatients: activePatients.length,
      newThisMonth: thisMonth.length,
      averageVisits,
    });
  };

  const applyFilters = () => {
    let filtered = [...patients];
    
    // Status filter
    if (filterStatus !== 'all') {
      const now = new Date();
      const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      
      filtered = filtered.filter(p => {
        const lastVisit = p.lastVisit ? new Date(p.lastVisit) : null;
        const isActive = lastVisit && lastVisit >= threeMonthsAgo;
        
        if (filterStatus === 'active') return isActive;
        if (filterStatus === 'inactive') return !isActive;
        return true;
      });
    }
    
    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(p => {
        const name = p.name?.toLowerCase() || '';
        const email = p.email?.toLowerCase() || '';
        const phone = p.phone || '';
        const query = searchQuery.toLowerCase();
        return name.includes(query) || email.includes(query) || phone.includes(query);
      });
    }
    
    // Sort by last visit (most recent first)
    filtered.sort((a, b) => {
      const dateA = a.lastVisit ? new Date(a.lastVisit) : new Date(0);
      const dateB = b.lastVisit ? new Date(b.lastVisit) : new Date(0);
      return dateB - dateA;
    });
    
    setFilteredPatients(filtered);
  };

  // Calculate age
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Get patient status
  const getPatientStatus = (patient) => {
    if (!patient.lastVisit) return 'new';
    
    const now = new Date();
    const lastVisit = new Date(patient.lastVisit);
    const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    
    return lastVisit >= threeMonthsAgo ? 'active' : 'inactive';
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      active: 'green',
      inactive: 'gray',
      new: 'blue',
    };
    return colors[status] || 'gray';
  };

  // Get status text
  const getStatusText = (status) => {
    const text = {
      active: 'Active',
      inactive: 'Inactive',
      new: 'New',
    };
    return text[status] || 'Unknown';
  };

  // Handle view patient details
  const handleViewDetails = async (patient) => {
    setSelectedPatient(patient);
    setShowDetailsModal(true);
    
    // Fetch patient history
    try {
      setLoadingHistory(true);
      const response = await doctorApi.getPatientHistory(patient.id);
      setPatientHistory(response.data || response.history);
    } catch (err) {
      console.error('Error loading patient history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Handle call patient
  const handleCall = (phoneNumber) => {
    if (phoneNumber) {
      window.location.href = `tel:${phoneNumber}`;
    }
  };

  // Handle email patient
  const handleEmail = (email) => {
    if (email) {
      window.location.href = `mailto:${email}`;
    }
  };

  // Handle view appointments
  const handleViewAppointments = (patientId) => {
    navigate(`/doctor/appointments?patient=${patientId}`);
  };

  // Handle export
  const handleExport = () => {
    const headers = ['Name', 'Age', 'Gender', 'Phone', 'Email', 'Last Visit', 'Total Visits', 'Status'];
    const rows = filteredPatients.map(p => [
      p.name || '',
      calculateAge(p.dateOfBirth),
      p.gender || '',
      p.phone || '',
      p.email || '',
      formatDate(p.lastVisit),
      p.visitCount || 0,
      getStatusText(getPatientStatus(p)),
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `patients-list-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Patients</h1>
            <p className="text-gray-600 mt-1">Manage and view your patient records</p>
          </div>
          <Button onClick={handleExport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Patients</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPatients}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Patients</p>
                <p className="text-2xl font-bold text-green-600">{stats.activePatients}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">New This Month</p>
                <p className="text-2xl font-bold text-indigo-600">{stats.newThisMonth}</p>
              </div>
              <div className="bg-indigo-100 p-3 rounded-lg">
                <UserPlus className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Avg Visits</p>
                <p className="text-2xl font-bold text-purple-600">{stats.averageVisits}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Patients</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </Card>
      </div>

      {/* Patients List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : filteredPatients.length === 0 ? (
        <Card className="text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No patients found
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || filterStatus !== 'all'
              ? 'Try adjusting your filters'
              : 'Your patient list will appear here'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((patient) => {
            const status = getPatientStatus(patient);
            return (
              <Card
                key={patient.id}
                className="hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full w-12 h-12 flex items-center justify-center text-white font-semibold text-lg">
                      {patient.name?.charAt(0).toUpperCase() || 'P'}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {patient.name || 'Unknown Patient'}
                      </h3>
                      <Badge variant={getStatusColor(status)}>
                        {getStatusText(status)}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Patient Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2 text-gray-400" />
                    {calculateAge(patient.dateOfBirth)} years, {patient.gender || 'N/A'}
                  </div>
                  
                  {patient.phone && (
                    <button
                      onClick={() => handleCall(patient.phone)}
                      className="flex items-center text-sm text-indigo-600 hover:text-indigo-700 w-full"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      {patient.phone}
                    </button>
                  )}
                  
                  {patient.email && (
                    <button
                      onClick={() => handleEmail(patient.email)}
                      className="flex items-center text-sm text-indigo-600 hover:text-indigo-700 w-full"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      {patient.email}
                    </button>
                  )}
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    Last visit: {formatDate(patient.lastVisit)}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Activity className="w-4 h-4 mr-2 text-gray-400" />
                    Total visits: {patient.visitCount || 0}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(patient)}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Details
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewAppointments(patient.id)}
                    className="flex-1"
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    History
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Patient Details Modal */}
      {showDetailsModal && selectedPatient && (
        <Modal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedPatient(null);
            setPatientHistory(null);
          }}
          title="Patient Details"
          size="xl"
        >
          <div className="space-y-6">
            {/* Patient Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Patient Information
              </h3>
              <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Full Name</p>
                  <p className="font-medium text-gray-900">{selectedPatient.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Age / Gender</p>
                  <p className="font-medium text-gray-900">
                    {calculateAge(selectedPatient.dateOfBirth)} years, {selectedPatient.gender || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Phone</p>
                  <p className="font-medium text-gray-900">{selectedPatient.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Email</p>
                  <p className="font-medium text-gray-900">{selectedPatient.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Blood Type</p>
                  <p className="font-medium text-gray-900">{selectedPatient.bloodType || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Status</p>
                  <Badge variant={getStatusColor(getPatientStatus(selectedPatient))}>
                    {getStatusText(getPatientStatus(selectedPatient))}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Medical History */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Medical History
              </h3>
              
              {loadingHistory ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner />
                </div>
              ) : patientHistory && patientHistory.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {patientHistory.map((record, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-gray-900">{record.diagnosis || 'General Consultation'}</p>
                          <p className="text-xs text-gray-500">{formatDate(record.date)}</p>
                        </div>
                        <Badge variant="info">{record.type || 'Consultation'}</Badge>
                      </div>
                      {record.notes && (
                        <p className="text-sm text-gray-600 mt-2">{record.notes}</p>
                      )}
                      {record.prescription && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <p className="text-xs text-gray-600">Prescription: {record.prescription}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">No medical history available</p>
                </div>
              )}
            </div>

            {/* Visit Statistics */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Visit Statistics
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600 mb-1">Total Visits</p>
                  <p className="text-2xl font-bold text-blue-600">{selectedPatient.visitCount || 0}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600 mb-1">Last Visit</p>
                  <p className="text-sm font-semibold text-green-600">
                    {formatDate(selectedPatient.lastVisit)}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600 mb-1">First Visit</p>
                  <p className="text-sm font-semibold text-purple-600">
                    {formatDate(selectedPatient.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => handleViewAppointments(selectedPatient.id)}
              >
                <Calendar className="w-4 h-4 mr-2" />
                View Appointments
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedPatient(null);
                  setPatientHistory(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default DoctorPatients;
