import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Clock,
  Download,
  Filter,
  Search,
  CreditCard,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Receipt,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import doctorApi from '../../api/doctorApi';
import paymentApi from '../../api/paymentApi';

/**
 * DoctorEarnings Component
 * 
 * Financial management for doctors
 * View earnings, payment history, and analytics
 * 
 * @component
 */
const DoctorEarnings = () => {
  const navigate = useNavigate();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [earnings, setEarnings] = useState([]);
  const [statistics, setStatistics] = useState({
    totalEarnings: 0,
    thisMonth: 0,
    pendingPayments: 0,
    completedPayments: 0,
    averagePerConsultation: 0,
    totalConsultations: 0,
  });
  const [selectedPeriod, setSelectedPeriod] = useState('all'); // all, today, week, month, year
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, completed, pending, failed
  const [error, setError] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEarning, setSelectedEarning] = useState(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Fetch earnings data
  useEffect(() => {
    fetchEarnings();
  }, [selectedPeriod, statusFilter]);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await doctorApi.getEarnings({
        period: selectedPeriod,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        startDate: dateRange.start || undefined,
        endDate: dateRange.end || undefined,
      });
      
      if (response.data) {
        setEarnings(response.data.earnings || []);
        setStatistics(response.data.statistics || statistics);
      }
    } catch (err) {
      console.error('Error fetching earnings:', err);
      setError('Failed to load earnings data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter earnings based on search
  const filteredEarnings = earnings.filter(earning => {
    const matchesSearch = 
      earning.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      earning.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      earning.appointmentId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Calculate period comparison
  const calculatePeriodChange = () => {
    // This would compare current period to previous period
    // For now, returning mock data
    const change = 12.5; // percentage
    return {
      value: change,
      isPositive: change >= 0,
    };
  };

  const periodChange = calculatePeriodChange();

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
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

  // Format time
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Date', 'Patient', 'Transaction ID', 'Amount', 'Status', 'Payment Method'];
    const rows = filteredEarnings.map(earning => [
      formatDate(earning.date),
      earning.patient?.name || 'N/A',
      earning.transactionId || 'N/A',
      earning.amount || 0,
      earning.status || 'N/A',
      earning.paymentMethod || 'N/A',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `earnings-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // View earning details
  const handleViewDetails = (earning) => {
    setSelectedEarning(earning);
    setShowDetailModal(true);
  };

  // Get status badge variant
  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
      case 'cancelled':
        return 'danger';
      default:
        return 'gray';
    }
  };

  // Get payment method icon
  const getPaymentMethodIcon = (method) => {
    switch (method?.toLowerCase()) {
      case 'card':
      case 'credit_card':
        return <CreditCard className="w-4 h-4" />;
      case 'wallet':
        return <Wallet className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
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
            <h1 className="text-3xl font-bold text-gray-900">Earnings & Payments</h1>
            <p className="text-gray-600 mt-1">Track your income and payment history</p>
          </div>
          <Button onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {error && (
          <Alert variant="error" className="mb-4" onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 mb-1 font-medium">Total Earnings</p>
                <p className="text-2xl font-bold text-green-900">
                  {formatCurrency(statistics.totalEarnings)}
                </p>
                <div className="flex items-center mt-2">
                  {periodChange.isPositive ? (
                    <ArrowUpRight className="w-4 h-4 text-green-600" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-600" />
                  )}
                  <span className={`text-sm ml-1 ${periodChange.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(periodChange.value)}% vs last period
                  </span>
                </div>
              </div>
              <div className="bg-green-500 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 mb-1 font-medium">This Month</p>
                <p className="text-2xl font-bold text-blue-900">
                  {formatCurrency(statistics.thisMonth)}
                </p>
                <p className="text-sm text-blue-600 mt-2">
                  {statistics.totalConsultations} consultations
                </p>
              </div>
              <div className="bg-blue-500 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700 mb-1 font-medium">Pending Payments</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {formatCurrency(statistics.pendingPayments)}
                </p>
                <p className="text-sm text-yellow-600 mt-2">
                  Awaiting settlement
                </p>
              </div>
              <div className="bg-yellow-500 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 mb-1 font-medium">Average/Consultation</p>
                <p className="text-2xl font-bold text-purple-900">
                  {formatCurrency(statistics.averagePerConsultation)}
                </p>
                <p className="text-sm text-purple-600 mt-2">
                  {statistics.completedPayments} completed
                </p>
              </div>
              <div className="bg-purple-500 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
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
                placeholder="Search by patient, transaction ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Period Filter */}
          <div>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <Input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <Input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            />
          </div>
        </div>

        {(dateRange.start || dateRange.end) && (
          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setDateRange({ start: '', end: '' });
                fetchEarnings();
              }}
              className="mr-2"
            >
              Clear Dates
            </Button>
            <Button size="sm" onClick={fetchEarnings}>
              Apply Filter
            </Button>
          </div>
        )}
      </Card>

      {/* Earnings List */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Payment History</h2>
          <Badge variant="gray">{filteredEarnings.length} transactions</Badge>
        </div>

        {filteredEarnings.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Receipt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-2">No earnings found</p>
            <p className="text-gray-500 text-sm">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Your payment history will appear here'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEarnings.map((earning) => (
                  <tr key={earning._id || earning.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatDate(earning.date)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatTime(earning.date)}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                          <span className="text-sm font-semibold text-indigo-600">
                            {earning.patient?.name?.charAt(0) || 'P'}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {earning.patient?.name || 'Unknown Patient'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {earning.appointmentType || 'Consultation'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-mono">
                        {earning.transactionId || 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(earning.amount)}
                      </div>
                      {earning.platformFee && (
                        <div className="text-xs text-gray-500">
                          Fee: {formatCurrency(earning.platformFee)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        {getPaymentMethodIcon(earning.paymentMethod)}
                        <span className="ml-2 capitalize">
                          {earning.paymentMethod || 'Card'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Badge variant={getStatusVariant(earning.status)}>
                        {earning.status || 'Completed'}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(earning)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Payment Details"
      >
        {selectedEarning && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {formatCurrency(selectedEarning.amount)}
                </h3>
                <p className="text-sm text-gray-500">
                  {formatDate(selectedEarning.date)} at {formatTime(selectedEarning.date)}
                </p>
              </div>
              <Badge variant={getStatusVariant(selectedEarning.status)} className="text-base">
                {selectedEarning.status || 'Completed'}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Patient</p>
                <p className="text-sm text-gray-900">{selectedEarning.patient?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Appointment Type</p>
                <p className="text-sm text-gray-900 capitalize">
                  {selectedEarning.appointmentType || 'Consultation'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Transaction ID</p>
                <p className="text-sm text-gray-900 font-mono">
                  {selectedEarning.transactionId || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Payment Method</p>
                <div className="flex items-center text-sm text-gray-900">
                  {getPaymentMethodIcon(selectedEarning.paymentMethod)}
                  <span className="ml-2 capitalize">
                    {selectedEarning.paymentMethod || 'Card'}
                  </span>
                </div>
              </div>
            </div>

            {selectedEarning.platformFee && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Consultation Fee</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(selectedEarning.amount + selectedEarning.platformFee)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Platform Fee</span>
                  <span className="text-red-600">
                    -{formatCurrency(selectedEarning.platformFee)}
                  </span>
                </div>
                <div className="flex justify-between text-base font-semibold pt-2 border-t">
                  <span className="text-gray-900">Net Amount</span>
                  <span className="text-green-600">
                    {formatCurrency(selectedEarning.amount)}
                  </span>
                </div>
              </div>
            )}

            {selectedEarning.notes && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Notes</p>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {selectedEarning.notes}
                </p>
              </div>
            )}

            <div className="flex items-center justify-end space-x-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowDetailModal(false)}>
                Close
              </Button>
              <Button onClick={() => {
                // Download invoice/receipt
                alert('Invoice download feature coming soon!');
              }}>
                <Download className="w-4 h-4 mr-2" />
                Download Receipt
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DoctorEarnings;
