import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCard,
  DollarSign,
  Download,
  Calendar,
  Clock,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Plus,
  Trash2,
  FileText,
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  Info,
  ChevronRight,
  BarChart3
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';

const Billing = () => {
  const navigate = useNavigate();
  
  // State management
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, paid, pending, failed
  const [dateFilter, setDateFilter] = useState('all'); // all, last30, last90, lastyear
  
  // Modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  
  // Payment form
  const [paymentForm, setPaymentForm] = useState({
    transactionId: '',
    amount: 0,
    paymentMethodId: ''
  });
  const [processingPayment, setProcessingPayment] = useState(false);

  // Add card form
  const [cardForm, setCardForm] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    billingAddress: ''
  });
  const [addingCard, setAddingCard] = useState(false);

  // Mock data - Replace with API call
  const mockTransactions = [
    {
      id: '1',
      invoiceNumber: 'INV-2024-001',
      type: 'consultation',
      description: 'Video Consultation - Dr. Sarah Johnson',
      date: new Date('2024-01-15'),
      amount: 150.00,
      status: 'paid',
      paymentMethod: 'Visa ending in 4242',
      doctor: 'Dr. Sarah Johnson',
      appointmentDate: new Date('2024-01-15'),
      receiptUrl: '/receipts/inv-2024-001.pdf'
    },
    {
      id: '2',
      invoiceNumber: 'INV-2024-002',
      type: 'lab',
      description: 'Complete Blood Count (CBC)',
      date: new Date('2024-01-10'),
      amount: 85.00,
      status: 'paid',
      paymentMethod: 'Mastercard ending in 8888',
      doctor: 'Dr. Michael Chen',
      appointmentDate: new Date('2024-01-10'),
      receiptUrl: '/receipts/inv-2024-002.pdf'
    },
    {
      id: '3',
      invoiceNumber: 'INV-2024-003',
      type: 'consultation',
      description: 'In-person Consultation - Dr. Emily Davis',
      date: new Date('2024-01-08'),
      amount: 120.00,
      status: 'pending',
      paymentMethod: null,
      doctor: 'Dr. Emily Davis',
      appointmentDate: new Date('2024-01-08'),
      receiptUrl: null,
      dueDate: new Date('2024-01-22')
    },
    {
      id: '4',
      invoiceNumber: 'INV-2024-004',
      type: 'lab',
      description: 'Lipid Panel Test',
      date: new Date('2024-01-08'),
      amount: 95.00,
      status: 'pending',
      paymentMethod: null,
      doctor: 'Dr. Michael Chen',
      appointmentDate: new Date('2024-01-08'),
      receiptUrl: null,
      dueDate: new Date('2024-01-22')
    },
    {
      id: '5',
      invoiceNumber: 'INV-2024-005',
      type: 'prescription',
      description: 'Medication - Metformin 500mg',
      date: new Date('2024-01-05'),
      amount: 45.00,
      status: 'paid',
      paymentMethod: 'Visa ending in 4242',
      doctor: 'Dr. Michael Chen',
      appointmentDate: new Date('2024-01-05'),
      receiptUrl: '/receipts/inv-2024-005.pdf'
    },
    {
      id: '6',
      invoiceNumber: 'INV-2023-089',
      type: 'consultation',
      description: 'Follow-up Consultation - Dr. Sarah Johnson',
      date: new Date('2023-12-20'),
      amount: 100.00,
      status: 'paid',
      paymentMethod: 'Mastercard ending in 8888',
      doctor: 'Dr. Sarah Johnson',
      appointmentDate: new Date('2023-12-20'),
      receiptUrl: '/receipts/inv-2023-089.pdf'
    },
    {
      id: '7',
      invoiceNumber: 'INV-2023-088',
      type: 'lab',
      description: 'Thyroid Function Test',
      date: new Date('2023-12-15'),
      amount: 110.00,
      status: 'failed',
      paymentMethod: 'Visa ending in 4242',
      doctor: 'Dr. Emily Davis',
      appointmentDate: new Date('2023-12-15'),
      receiptUrl: null,
      failureReason: 'Insufficient funds'
    }
  ];

  const mockPaymentMethods = [
    {
      id: '1',
      type: 'visa',
      last4: '4242',
      cardHolder: 'John Doe',
      expiryMonth: '12',
      expiryYear: '2025',
      isDefault: true
    },
    {
      id: '2',
      type: 'mastercard',
      last4: '8888',
      cardHolder: 'John Doe',
      expiryMonth: '06',
      expiryYear: '2026',
      isDefault: false
    }
  ];

  useEffect(() => {
    fetchBillingData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [transactions, searchQuery, statusFilter, dateFilter]);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 800));
      setTransactions(mockTransactions);
      setPaymentMethods(mockPaymentMethods);
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
      .filter(tx => tx.status === 'paid')
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
    setSelectedTransaction(transaction);
    setPaymentForm({
      transactionId: transaction.id,
      amount: transaction.amount,
      paymentMethodId: paymentMethods.find(pm => pm.isDefault)?.id || ''
    });
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async () => {
    if (!paymentForm.paymentMethodId) {
      alert('Please select a payment method');
      return;
    }
    
    try {
      setProcessingPayment(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update transaction status
      setTransactions(prev => prev.map(tx => 
        tx.id === selectedTransaction.id 
          ? { ...tx, status: 'paid', paymentMethod: paymentMethods.find(pm => pm.id === paymentForm.paymentMethodId)?.type + ' ending in ' + paymentMethods.find(pm => pm.id === paymentForm.paymentMethodId)?.last4 }
          : tx
      ));
      
      setShowPaymentModal(false);
      alert('Payment successful!');
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleAddCard = async () => {
    if (!cardForm.cardNumber || !cardForm.cardHolder || !cardForm.expiryMonth || !cardForm.expiryYear || !cardForm.cvv) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      setAddingCard(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newCard = {
        id: String(paymentMethods.length + 1),
        type: cardForm.cardNumber.startsWith('4') ? 'visa' : 'mastercard',
        last4: cardForm.cardNumber.slice(-4),
        cardHolder: cardForm.cardHolder,
        expiryMonth: cardForm.expiryMonth,
        expiryYear: cardForm.expiryYear,
        isDefault: paymentMethods.length === 0
      };
      
      setPaymentMethods([...paymentMethods, newCard]);
      setShowAddCardModal(false);
      setCardForm({
        cardNumber: '',
        cardHolder: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        billingAddress: ''
      });
      alert('Card added successfully!');
    } catch (error) {
      console.error('Add card error:', error);
      alert('Failed to add card');
    } finally {
      setAddingCard(false);
    }
  };

  const handleRemoveCard = async (cardId) => {
    if (!confirm('Are you sure you want to remove this payment method?')) {
      return;
    }
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setPaymentMethods(prev => prev.filter(pm => pm.id !== cardId));
      alert('Payment method removed');
    } catch (error) {
      console.error('Remove card error:', error);
      alert('Failed to remove payment method');
    }
  };

  const handleSetDefaultCard = async (cardId) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setPaymentMethods(prev => prev.map(pm => ({
        ...pm,
        isDefault: pm.id === cardId
      })));
      alert('Default payment method updated');
    } catch (error) {
      console.error('Set default error:', error);
      alert('Failed to update default payment method');
    }
  };

  const handleViewInvoice = (transaction) => {
    setSelectedTransaction(transaction);
    setShowInvoiceModal(true);
  };

  const handleDownloadInvoice = (transaction) => {
    // Simulate PDF download
    alert(`Downloading invoice ${transaction.invoiceNumber}...`);
    console.log('Downloading:', transaction);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return <Badge variant="success">Paid</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'failed':
        return <Badge variant="danger">Failed</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'pending':
        return <Clock className="text-orange-600" size={20} />;
      case 'failed':
        return <XCircle className="text-red-600" size={20} />;
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

  const getCardIcon = (type) => {
    switch (type) {
      case 'visa':
        return (
          <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
            VISA
          </div>
        );
      case 'mastercard':
        return (
          <div className="w-12 h-8 bg-red-600 rounded flex items-center justify-center text-white text-xs font-bold">
            MC
          </div>
        );
      default:
        return <CreditCard className="text-slate-600" size={32} />;
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

        {/* Payment Methods */}
        <Card className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900">Payment Methods</h2>
            <Button onClick={() => setShowAddCardModal(true)} size="sm">
              <Plus className="mr-1" size={16} />
              Add Card
            </Button>
          </div>

          {paymentMethods.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="mx-auto text-slate-400 mb-4" size={48} />
              <p className="text-slate-600 mb-4">No payment methods added</p>
              <Button onClick={() => setShowAddCardModal(true)}>
                <Plus className="mr-2" size={20} />
                Add Your First Card
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={`p-4 rounded-xl border-2 ${
                    method.isDefault ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    {getCardIcon(method.type)}
                    {method.isDefault && (
                      <Badge variant="primary">Default</Badge>
                    )}
                  </div>
                  
                  <p className="font-semibold text-slate-900 mb-1">
                    •••• •••• •••• {method.last4}
                  </p>
                  <p className="text-sm text-slate-600 mb-1">{method.cardHolder}</p>
                  <p className="text-sm text-slate-500 mb-3">
                    Expires {method.expiryMonth}/{method.expiryYear}
                  </p>
                  
                  <div className="flex gap-2">
                    {!method.isDefault && (
                      <Button
                        onClick={() => handleSetDefaultCard(method.id)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        Set Default
                      </Button>
                    )}
                    <Button
                      onClick={() => handleRemoveCard(method.id)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Trash2 size={14} className="mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

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
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
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
                          {transaction.status === 'paid' && (
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

      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => !processingPayment && setShowPaymentModal(false)}
        title="Make Payment"
      >
        {selectedTransaction && (
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm text-slate-600 mb-1">Invoice Number:</p>
              <p className="font-semibold text-slate-900 mb-3">{selectedTransaction.invoiceNumber}</p>
              
              <p className="text-sm text-slate-600 mb-1">Description:</p>
              <p className="text-slate-900 mb-3">{selectedTransaction.description}</p>
              
              <p className="text-sm text-slate-600 mb-1">Amount to Pay:</p>
              <p className="text-2xl font-bold text-indigo-600">
                ${selectedTransaction.amount.toFixed(2)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Payment Method <span className="text-red-600">*</span>
              </label>
              <select
                value={paymentForm.paymentMethodId}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethodId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Select payment method...</option>
                {paymentMethods.map((method) => (
                  <option key={method.id} value={method.id}>
                    {method.type.toUpperCase()} ending in {method.last4}
                    {method.isDefault ? ' (Default)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <Info className="text-blue-600 flex-shrink-0" size={20} />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Secure Payment</p>
                  <p>Your payment information is encrypted and secure. You will receive a receipt via email.</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => setShowPaymentModal(false)}
                variant="outline"
                disabled={processingPayment}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePaymentSubmit}
                disabled={processingPayment}
                className="flex-1"
              >
                {processingPayment ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2" size={20} />
                    Pay ${selectedTransaction.amount.toFixed(2)}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Card Modal */}
      <Modal
        isOpen={showAddCardModal}
        onClose={() => !addingCard && setShowAddCardModal(false)}
        title="Add Payment Method"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Card Number <span className="text-red-600">*</span>
            </label>
            <Input
              type="text"
              placeholder="1234 5678 9012 3456"
              value={cardForm.cardNumber}
              onChange={(e) => setCardForm({ ...cardForm, cardNumber: e.target.value.replace(/\s/g, '') })}
              maxLength={16}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Cardholder Name <span className="text-red-600">*</span>
            </label>
            <Input
              type="text"
              placeholder="John Doe"
              value={cardForm.cardHolder}
              onChange={(e) => setCardForm({ ...cardForm, cardHolder: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Month <span className="text-red-600">*</span>
              </label>
              <select
                value={cardForm.expiryMonth}
                onChange={(e) => setCardForm({ ...cardForm, expiryMonth: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">MM</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                  <option key={month} value={String(month).padStart(2, '0')}>
                    {String(month).padStart(2, '0')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Year <span className="text-red-600">*</span>
              </label>
              <select
                value={cardForm.expiryYear}
                onChange={(e) => setCardForm({ ...cardForm, expiryYear: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">YYYY</option>
                {Array.from({ length: 10 }, (_, i) => 2024 + i).map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                CVV <span className="text-red-600">*</span>
              </label>
              <Input
                type="text"
                placeholder="123"
                value={cardForm.cvv}
                onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value })}
                maxLength={4}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Billing Address (Optional)
            </label>
            <textarea
              value={cardForm.billingAddress}
              onChange={(e) => setCardForm({ ...cardForm, billingAddress: e.target.value })}
              rows={3}
              placeholder="Enter your billing address..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => setShowAddCardModal(false)}
              variant="outline"
              disabled={addingCard}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddCard}
              disabled={addingCard}
              className="flex-1"
            >
              {addingCard ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="mr-2" size={20} />
                  Add Card
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>

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
