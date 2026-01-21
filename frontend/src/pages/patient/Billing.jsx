import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCard,
  DollarSign,
  Download,
  Clock,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  FileText,
  Receipt,
  User,
  BarChart3
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import axiosInstance from '../../api/axiosInstance';

const Billing = () => {
  const navigate = useNavigate();
  
  // State management
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, completed, pending, failed, refunded
  const [dateFilter, setDateFilter] = useState('all'); // all, last30, last90, lastyear
  
  // Modal states
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const normalizePaymentStatus = (status) => {
    if (!status) return 'pending';
    const s = String(status).toLowerCase();
    if (s === 'succeeded') return 'completed';
    return s;
  };

  const toBillingTransaction = (payment) => {
    const id = payment?._id || payment?.id;
    const invoiceNumber =
      payment?.transactionId || (id ? String(id).slice(-8).toUpperCase() : 'N/A');

    const doctorName = payment?.doctor?.name || 'Doctor';
    const appointmentDate = payment?.appointment?.date
      ? new Date(payment.appointment.date)
      : payment?.createdAt
        ? new Date(payment.createdAt)
        : new Date();

    const description =
      payment?.description || `Appointment payment - ${doctorName}`;

    return {
      id,
      invoiceNumber: `INV-${invoiceNumber}`,
      type: 'consultation',
      description,
      date: payment?.createdAt ? new Date(payment.createdAt) : new Date(),
      amount: Number(payment?.amount || 0),
      status: normalizePaymentStatus(payment?.status),
      paymentMethod: payment?.paymentMethod || null,
      doctor: doctorName,
      appointmentId: payment?.appointment?._id || payment?.appointment,
      appointmentDate,
      receiptUrl: payment?.receiptUrl || null,
    };
  };

  useEffect(() => {
    fetchBillingData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [transactions, searchQuery, statusFilter, dateFilter]);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get('/patients/payments');
      const payments = data?.payments || [];
      setTransactions(payments.map(toBillingTransaction));
    } catch (error) {
      console.error('Error fetching billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...transactions];
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(tx => tx.status === statusFilter);
    }
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(tx =>
        tx.invoiceNumber.toLowerCase().includes(query) ||
        tx.description.toLowerCase().includes(query) ||
        tx.doctor.toLowerCase().includes(query)
      );
    }
    
    // Date filter
    const now = new Date();
    if (dateFilter !== 'all') {
      filtered = filtered.filter(tx => {
        const txDate = new Date(tx.date);
        const daysDiff = Math.floor((now - txDate) / (1000 * 60 * 60 * 24));
        
        switch (dateFilter) {
          case 'last30':
            return daysDiff <= 30;
          case 'last90':
            return daysDiff <= 90;
          case 'lastyear':
            return daysDiff <= 365;
          default:
            return true;
        }
      });
    }
    
    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    setFilteredTransactions(filtered);
  };

  const calculateSummary = () => {
    const total = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    const paid = transactions
      .filter(tx => tx.status === 'completed')
      .reduce((sum, tx) => sum + tx.amount, 0);
    const pending = transactions
      .filter(tx => tx.status === 'pending')
      .reduce((sum, tx) => sum + tx.amount, 0);
    const failed = transactions
      .filter(tx => tx.status === 'failed')
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    return { total, paid, pending, failed };
  };

  const handlePayNow = (transaction) => {
    if (!transaction?.appointmentId) {
      alert('This payment is not linked to an appointment.');
      return;
    }

    navigate(`/patient/payment/${transaction.appointmentId}`);
  };

  const handleViewInvoice = (transaction) => {
    setSelectedTransaction(transaction);
    setShowInvoiceModal(true);
  };

  const handleDownloadInvoice = (transaction) => {
    // Prefer receiptUrl if available, otherwise show printable invoice page
    if (transaction?.receiptUrl) {
      window.open(transaction.receiptUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    if (transaction?.id) {
      navigate(`/patient/invoice/${transaction.id}`);
      return;
    }

    alert('Invoice is not available for this payment.');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">Paid</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'failed':
        return <Badge variant="danger">Failed</Badge>;
      case 'refunded':
        return <Badge variant="default">Refunded</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'pending':
        return <Clock className="text-orange-600" size={20} />;
      case 'failed':
        return <XCircle className="text-red-600" size={20} />;
      case 'refunded':
        return <AlertCircle className="text-slate-600" size={20} />;
      default:
        return <AlertCircle className="text-slate-600" size={20} />;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'consultation':
        return <User className="text-indigo-600" size={20} />;
      case 'lab':
        return <FileText className="text-blue-600" size={20} />;
      case 'prescription':
        return <Receipt className="text-green-600" size={20} />;
      default:
        return <DollarSign className="text-slate-600" size={20} />;
    }
  };

  const summary = calculateSummary();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-slate-600">Loading billing information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Billing & Payments</h1>
              <p className="text-sm text-slate-600 mt-1">
                Manage your payments and billing information
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">
                <BarChart3 className="mr-2" size={20} />
                View Analytics
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm mb-1">Total Amount</p>
                <p className="text-3xl font-bold">${summary.total.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <DollarSign size={24} />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm mb-1">Paid</p>
                <p className="text-3xl font-bold">${summary.paid.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <CheckCircle size={24} />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm mb-1">Pending</p>
                <p className="text-3xl font-bold">${summary.pending.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <Clock size={24} />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm mb-1">Failed</p>
                <p className="text-3xl font-bold">${summary.failed.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <XCircle size={24} />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <Input
                  type="text"
                  placeholder="Search by invoice, description, or doctor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="completed">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="last30">Last 30 Days</option>
              <option value="last90">Last 90 Days</option>
              <option value="lastyear">Last Year</option>
            </select>
          </div>
        </Card>

        {/* Transaction History */}
        <Card>
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Transaction History</h2>

          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="mx-auto text-slate-400 mb-4" size={64} />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No Transactions Found</h3>
              <p className="text-slate-600">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Your transaction history will appear here'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Invoice</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Description</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(transaction.type)}
                          <span className="font-medium text-slate-900">
                            {transaction.invoiceNumber}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-slate-900">{transaction.description}</p>
                        <p className="text-sm text-slate-600">{transaction.doctor}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-slate-900">{formatDate(transaction.date)}</p>
                        {transaction.dueDate && transaction.status === 'pending' && (
                          <p className="text-xs text-orange-600">
                            Due: {formatDate(transaction.dueDate)}
                          </p>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-semibold text-slate-900">
                          ${transaction.amount.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(transaction.status)}
                          {getStatusBadge(transaction.status)}
                        </div>
                        {transaction.paymentMethod && (
                          <p className="text-xs text-slate-500 mt-1">
                            {transaction.paymentMethod}
                          </p>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            onClick={() => handleViewInvoice(transaction)}
                            variant="outline"
                            size="sm"
                          >
                            <Eye size={14} />
                          </Button>
                          {transaction.status === 'completed' && (
                            <Button
                              onClick={() => handleDownloadInvoice(transaction)}
                              variant="outline"
                              size="sm"
                            >
                              <Download size={14} />
                            </Button>
                          )}
                          {transaction.status === 'pending' && (
                            <Button
                              onClick={() => handlePayNow(transaction)}
                              size="sm"
                            >
                              Pay Now
                            </Button>
                          )}
                          {transaction.status === 'failed' && (
                            <Button
                              onClick={() => handlePayNow(transaction)}
                              variant="outline"
                              size="sm"
                            >
                              Retry
                            </Button>
                          )}
                          {transaction.status === 'refunded' && (
                            <Button
                              onClick={() => handleViewInvoice(transaction)}
                              variant="outline"
                              size="sm"
                            >
                              Details
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Invoice Detail Modal */}
      <Modal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        title="Invoice Details"
        size="lg"
      >
        {selectedTransaction && (
          <div className="space-y-6">
            {/* Invoice Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-1">
                  {selectedTransaction.invoiceNumber}
                </h3>
                <p className="text-slate-600">
                  {formatDate(selectedTransaction.date)}
                </p>
              </div>
              {getStatusBadge(selectedTransaction.status)}
            </div>

            {/* Invoice Details */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">Service Details</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-slate-600">Type:</p>
                    <p className="font-medium text-slate-900 capitalize">{selectedTransaction.type}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Description:</p>
                    <p className="font-medium text-slate-900">{selectedTransaction.description}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Doctor:</p>
                    <p className="font-medium text-slate-900">{selectedTransaction.doctor}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Appointment Date:</p>
                    <p className="font-medium text-slate-900">
                      {formatDate(selectedTransaction.appointmentDate)}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 mb-3">Payment Information</h4>
                <div className="space-y-2 text-sm">
                  {selectedTransaction.paymentMethod && (
                    <div>
                      <p className="text-slate-600">Payment Method:</p>
                      <p className="font-medium text-slate-900">{selectedTransaction.paymentMethod}</p>
                    </div>
                  )}
                  {selectedTransaction.dueDate && (
                    <div>
                      <p className="text-slate-600">Due Date:</p>
                      <p className="font-medium text-slate-900">
                        {formatDate(selectedTransaction.dueDate)}
                      </p>
                    </div>
                  )}
                  {selectedTransaction.failureReason && (
                    <div>
                      <p className="text-slate-600">Failure Reason:</p>
                      <p className="font-medium text-red-600">{selectedTransaction.failureReason}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Amount */}
            <div className="bg-indigo-50 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-slate-900">Total Amount:</span>
                <span className="text-3xl font-bold text-indigo-600">
                  ${selectedTransaction.amount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-slate-200">
              {selectedTransaction.status === 'paid' && (
                <Button
                  onClick={() => handleDownloadInvoice(selectedTransaction)}
                  className="flex-1"
                >
                  <Download className="mr-2" size={20} />
                  Download Invoice
                </Button>
              )}
              {selectedTransaction.status === 'pending' && (
                <Button
                  onClick={() => {
                    setShowInvoiceModal(false);
                    handlePayNow(selectedTransaction);
                  }}
                  className="flex-1"
                >
                  <CreditCard className="mr-2" size={20} />
                  Pay Now
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Billing;
