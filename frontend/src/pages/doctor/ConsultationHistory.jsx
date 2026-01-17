import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import {
  Video,
  Calendar,
  Clock,
  User,
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  PlayCircle,
  MessageSquare,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import consultationApi from '../../api/consultationApi';

/**
 * ConsultationHistory Component
 * 
 * Displays doctor's past video consultations with search, filter,
 * and detailed view capabilities
 * 
 * @component
 */
const ConsultationHistory = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [consultations, setConsultations] = useState([]);
  const [filteredConsultations, setFilteredConsultations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all'); // all, today, week, month
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    averageDuration: 0,
    thisMonth: 0,
  });

  // Fetch consultation history
  useEffect(() => {
    fetchConsultationHistory();
  }, []);

  // Apply filters
  useEffect(() => {
    applyFilters();
  }, [consultations, searchQuery, statusFilter, dateFilter]);

  const fetchConsultationHistory = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await consultationApi.getHistory();
      const consultationData = response.consultations || response.data || [];
      setConsultations(consultationData);
      
      // Calculate statistics
      calculateStats(consultationData);
    } catch (err) {
      console.error('Error fetching consultation history:', err);
      setError('Failed to load consultation history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const completed = data.filter(c => c.status === 'completed');
    const totalDuration = completed.reduce((sum, c) => sum + (c.duration || 0), 0);
    const averageDuration = completed.length > 0 ? Math.round(totalDuration / completed.length) : 0;
    
    const now = new Date();
    const thisMonth = data.filter(c => {
      const consultDate = new Date(c.createdAt);
      return consultDate.getMonth() === now.getMonth() && 
             consultDate.getFullYear() === now.getFullYear();
    });
    
    setStats({
      total: data.length,
      completed: completed.length,
      averageDuration,
      thisMonth: thisMonth.length,
    });
  };

  const applyFilters = () => {
    let filtered = [...consultations];
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }
    
    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(c => {
        const consultDate = new Date(c.createdAt);
        
        switch (dateFilter) {
          case 'today':
            return consultDate.toDateString() === now.toDateString();
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return consultDate >= weekAgo;
          case 'month':
            return consultDate.getMonth() === now.getMonth() && 
                   consultDate.getFullYear() === now.getFullYear();
          default:
            return true;
        }
      });
    }
    
    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(c => {
        const patientName = c.patient?.name?.toLowerCase() || '';
        const notes = c.notes?.toLowerCase() || '';
        const query = searchQuery.toLowerCase();
        return patientName.includes(query) || notes.includes(query);
      });
    }
    
    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    setFilteredConsultations(filtered);
  };

  // Format duration
  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A';
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}m`;
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

  // Format time
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      scheduled: 'blue',
      ongoing: 'yellow',
      completed: 'green',
      cancelled: 'red',
    };
    return colors[status] || 'gray';
  };

  // Get status text
  const getStatusText = (status) => {
    return status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown';
  };

  // Handle view details
  const handleViewDetails = (consultation) => {
    setSelectedConsultation(consultation);
    setShowDetailsModal(true);
  };

  // Handle export
  const handleExport = () => {
    // Convert consultations to CSV
    const headers = ['Date', 'Time', 'Patient', 'Duration', 'Status', 'Notes'];
    const rows = filteredConsultations.map(c => [
      formatDate(c.startTime),
      formatTime(c.startTime),
      c.patient?.name || 'Unknown',
      formatDuration(c.duration),
      getStatusText(c.status),
      c.notes || '',
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `consultation-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Consultation History</h1>
            <p className="text-gray-600 mt-1">View your past video consultations</p>
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
                <p className="text-sm text-gray-600 mb-1">Total Consultations</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Video className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Avg Duration</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatDuration(stats.averageDuration)}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">This Month</p>
                <p className="text-2xl font-bold text-indigo-600">{stats.thisMonth}</p>
              </div>
              <div className="bg-indigo-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-indigo-600" />
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
                placeholder="Search by patient name or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="ongoing">Ongoing</option>
              </select>
            </div>

            {/* Date Filter */}
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        </Card>
      </div>

      {/* Consultations List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : filteredConsultations.length === 0 ? (
        <Card className="text-center py-12">
          <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No consultations found
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || statusFilter !== 'all' || dateFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Your consultation history will appear here'}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredConsultations.map((consultation) => (
            <Card
              key={consultation.id}
              className="hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start justify-between">
                {/* Left Section */}
                <div className="flex items-start space-x-4 flex-1">
                  {/* Date Badge */}
                  <div className="bg-indigo-100 text-indigo-700 rounded-lg px-4 py-3 text-center min-w-[90px]">
                    <Calendar className="w-5 h-5 mx-auto mb-1" />
                    <p className="text-xs font-medium">
                      {formatDate(consultation.startTime)}
                    </p>
                    <p className="text-xs">
                      {formatTime(consultation.startTime)}
                    </p>
                  </div>

                  {/* Consultation Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {consultation.patient?.name || 'Unknown Patient'}
                      </h3>
                      <Badge variant={getStatusColor(consultation.status)}>
                        {getStatusText(consultation.status)}
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1 text-gray-400" />
                          Duration: {formatDuration(consultation.duration)}
                        </span>
                        {consultation.appointment && (
                          <span className="flex items-center">
                            <FileText className="w-4 h-4 mr-1 text-gray-400" />
                            {consultation.appointment.type || 'Video Consultation'}
                          </span>
                        )}
                      </div>
                      
                      {consultation.notes && (
                        <p className="text-sm text-gray-500 line-clamp-2 mt-2">
                          <span className="font-medium">Notes:</span> {consultation.notes}
                        </p>
                      )}
                      
                      {consultation.prescriptionAdded && (
                        <div className="flex items-center text-sm text-green-600 mt-1">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Prescription added
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Section - Actions */}
                <div className="flex flex-col space-y-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(consultation)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  
                  {consultation.recordingUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(consultation.recordingUrl, '_blank')}
                    >
                      <PlayCircle className="w-4 h-4 mr-2" />
                      Recording
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Consultation Details Modal */}
      {showDetailsModal && selectedConsultation && (
        <Modal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedConsultation(null);
          }}
          title="Consultation Details"
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
                    {selectedConsultation.patient?.name || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium text-gray-900">
                    {selectedConsultation.patient?.email || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium text-gray-900">
                    {selectedConsultation.patient?.phone || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Consultation Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Consultation Details
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium text-gray-900">
                    {formatDate(selectedConsultation.startTime)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium text-gray-900">
                    {formatTime(selectedConsultation.startTime)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium text-gray-900">
                    {formatDuration(selectedConsultation.duration)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <Badge variant={getStatusColor(selectedConsultation.status)}>
                    {getStatusText(selectedConsultation.status)}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Prescription:</span>
                  <span className="font-medium text-gray-900">
                    {selectedConsultation.prescriptionAdded ? 'Added' : 'Not added'}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {selectedConsultation.notes && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Consultation Notes
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {selectedConsultation.notes}
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              {selectedConsultation.recordingUrl && (
                <Button
                  variant="outline"
                  onClick={() => window.open(selectedConsultation.recordingUrl, '_blank')}
                >
                  <PlayCircle className="w-4 h-4 mr-2" />
                  View Recording
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedConsultation(null);
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

export default ConsultationHistory;
