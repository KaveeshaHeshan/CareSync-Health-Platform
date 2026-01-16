import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Calendar,
  DollarSign,
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  FileText,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CreditCard,
  Building,
  Wallet,
  X,
  MapPin,
  Mail,
  Phone,
  User,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';

/**
 * PaymentHistory Component
 * 
 * Comprehensive payment history table with filtering, sorting, and pagination
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Array} props.transactions - Array of transaction objects
 * @param {Object} props.currentUser - Current user object with role
 * @param {Function} props.onRefund - Callback for refund action
 * @param {boolean} props.showFilters - Whether to show filter panel
 * @param {number} props.pageSize - Default page size
 * @param {Function} props.onExport - Callback for export action
 * @param {boolean} props.enableRefunds - Whether refunds are enabled
 * @param {Function} props.onLoadMore - Callback for loading more data
 */
const PaymentHistory = ({
  transactions: initialTransactions = [],
  currentUser = null,
  onRefund = null,
  showFilters = true,
  pageSize: defaultPageSize = 10,
  onExport = null,
  enableRefunds = false,
  onLoadMore = null,
  className = '',
}) => {
  // State management
  const [transactions, setTransactions] = useState(initialTransactions);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [dateRangeStart, setDateRangeStart] = useState('');
  const [dateRangeEnd, setDateRangeEnd] = useState('');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  
  // Sort states
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  
  // Modal states
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [refundingId, setRefundingId] = useState(null);

  // Update transactions when prop changes
  useEffect(() => {
    setTransactions(initialTransactions);
  }, [initialTransactions]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.id?.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query) ||
          t.patientName?.toLowerCase().includes(query) ||
          t.doctorName?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((t) => t.status === statusFilter);
    }

    // Payment method filter
    if (paymentMethodFilter !== 'all') {
      filtered = filtered.filter((t) => t.paymentMethod === paymentMethodFilter);
    }

    // Date range filter
    if (dateRangeStart) {
      const startDate = new Date(dateRangeStart);
      filtered = filtered.filter((t) => new Date(t.date) >= startDate);
    }
    if (dateRangeEnd) {
      const endDate = new Date(dateRangeEnd);
      endDate.setHours(23, 59, 59, 999); // End of day
      filtered = filtered.filter((t) => new Date(t.date) <= endDate);
    }

    return filtered;
  }, [transactions, searchQuery, statusFilter, paymentMethodFilter, dateRangeStart, dateRangeEnd]);

  // Sort transactions
  const sortedTransactions = useMemo(() => {
    const sorted = [...filteredTransactions];

    sorted.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle date sorting
      if (sortField === 'date') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      // Handle numeric sorting
      if (sortField === 'amount') {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      }

      // Handle string sorting
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    return sorted;
  }, [filteredTransactions, sortField, sortDirection]);

  // Paginate transactions
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedTransactions.slice(startIndex, endIndex);
  }, [sortedTransactions, currentPage, pageSize]);

  // Calculate pagination info
  const totalPages = Math.ceil(sortedTransactions.length / pageSize);
  const startRecord = sortedTransactions.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, sortedTransactions.length);

  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to descending
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Get sort icon
  const getSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown size={16} className="text-slate-400" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp size={16} className="text-indigo-600" />
    ) : (
      <ArrowDown size={16} className="text-indigo-600" />
    );
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Handle page size change
  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page
  };

  // Clear filters
  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setPaymentMethodFilter('all');
    setDateRangeStart('');
    setDateRangeEnd('');
    setCurrentPage(1);
  };

  // View transaction details
  const viewDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailsModal(true);
  };

  // Handle refund
  const handleRefundClick = async (transaction) => {
    if (!onRefund) return;

    const confirmed = window.confirm(
      `Are you sure you want to refund $${formatAmount(transaction.amount)} for transaction ${transaction.id}?`
    );

    if (!confirmed) return;

    try {
      setRefundingId(transaction.id);
      await onRefund(transaction.id);
      
      // Update transaction status locally
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === transaction.id ? { ...t, status: 'refunded' } : t
        )
      );
      
      alert('Refund processed successfully');
    } catch (error) {
      console.error('Refund error:', error);
      alert('Failed to process refund');
    } finally {
      setRefundingId(null);
    }
  };

  // Handle export
  const handleExport = (format) => {
    if (onExport) {
      onExport(format, sortedTransactions);
    } else {
      // Default export to CSV
      if (format === 'csv') {
        exportToCSV(sortedTransactions);
      }
    }
  };

  // Export to CSV
  const exportToCSV = (data) => {
    const headers = ['Date', 'Transaction ID', 'Amount', 'Payment Method', 'Status', 'Description'];
    const rows = data.map((t) => [
      formatDate(t.date),
      t.id,
      formatAmount(t.amount),
      t.paymentMethod,
      t.status,
      t.description,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `payment-history-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format time
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format amount
  const formatAmount = (amount) => {
    return parseFloat(amount).toFixed(2);
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { variant: 'success', icon: CheckCircle, label: 'Completed' },
      pending: { variant: 'warning', icon: Clock, label: 'Pending' },
      failed: { variant: 'danger', icon: XCircle, label: 'Failed' },
      refunded: { variant: 'info', icon: RefreshCw, label: 'Refunded' },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon size={14} />
        {config.label}
      </Badge>
    );
  };

  // Get payment method icon
  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'card':
        return <CreditCard size={16} />;
      case 'insurance':
        return <Building size={16} />;
      case 'cash':
        return <Wallet size={16} />;
      default:
        return <DollarSign size={16} />;
    }
  };

  // Check if user can refund
  const canRefund = (transaction) => {
    return (
      enableRefunds &&
      currentUser?.role === 'ADMIN' &&
      transaction.status === 'completed' &&
      onRefund
    );
  };

  // Render empty state
  if (transactions.length === 0 && !loading) {
    return (
      <Card className={className}>
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
            <FileText size={32} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Transactions</h3>
          <p className="text-slate-600">
            You don't have any payment transactions yet.
          </p>
        </div>
      </Card>
    );
  }

  // Render no results state
  if (sortedTransactions.length === 0 && !loading) {
    return (
      <Card className={className}>
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Payment History</h2>
        </div>
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
            <Search size={32} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Results Found</h3>
          <p className="text-slate-600 mb-4">
            No transactions match your current filters.
          </p>
          <Button onClick={clearFilters} variant="outline">
            Clear Filters
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className={className}>
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Payment History</h2>
              <p className="text-sm text-slate-600 mt-1">
                {sortedTransactions.length} transaction{sortedTransactions.length !== 1 ? 's' : ''} found
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Export Dropdown */}
              <div className="relative">
                <Button
                  variant="outline"
                  onClick={() => handleExport('csv')}
                  className="flex items-center gap-2"
                >
                  <Download size={18} />
                  Export CSV
                </Button>
              </div>

              {/* Filter Toggle */}
              {showFilters && (
                <Button
                  variant="outline"
                  onClick={() => setShowFilterPanel(!showFilterPanel)}
                  className="flex items-center gap-2"
                >
                  <Filter size={18} />
                  Filters
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && showFilterPanel && (
          <div className="p-6 bg-slate-50 border-b border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Transaction ID, description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              {/* Payment Method Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Payment Method
                </label>
                <select
                  value={paymentMethodFilter}
                  onChange={(e) => setPaymentMethodFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Methods</option>
                  <option value="card">Card</option>
                  <option value="insurance">Insurance</option>
                  <option value="cash">Cash</option>
                </select>
              </div>

              {/* Date Range Start */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Date From
                </label>
                <Input
                  type="date"
                  value={dateRangeStart}
                  onChange={(e) => setDateRangeStart(e.target.value)}
                />
              </div>

              {/* Date Range End */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Date To
                </label>
                <Input
                  type="date"
                  value={dateRangeEnd}
                  onChange={(e) => setDateRangeEnd(e.target.value)}
                />
              </div>
            </div>

            {/* Clear Filters */}
            {(searchQuery || statusFilter !== 'all' || paymentMethodFilter !== 'all' || dateRangeStart || dateRangeEnd) && (
              <div className="mt-4">
                <Button variant="ghost" onClick={clearFilters} className="text-indigo-600">
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Table - Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center gap-2">
                    Date
                    {getSortIcon('date')}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                  onClick={() => handleSort('amount')}
                >
                  <div className="flex items-center gap-2">
                    Amount
                    {getSortIcon('amount')}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Payment Method
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-2">
                    Status
                    {getSortIcon('status')}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <Spinner size="lg" />
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">
                        {formatDate(transaction.date)}
                      </div>
                      <div className="text-xs text-slate-500">
                        {formatTime(transaction.date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900 font-mono">
                        {transaction.id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-slate-900">
                        ${formatAmount(transaction.amount)}
                      </div>
                      <div className="text-xs text-slate-500">
                        {transaction.currency?.toUpperCase() || 'USD'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-slate-700">
                        {getPaymentMethodIcon(transaction.paymentMethod)}
                        <span className="capitalize">{transaction.paymentMethod}</span>
                      </div>
                      {transaction.cardLast4 && (
                        <div className="text-xs text-slate-500 mt-1">
                          •••• {transaction.cardLast4}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(transaction.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-900">
                        {transaction.description}
                      </div>
                      {transaction.appointmentId && (
                        <div className="text-xs text-slate-500 mt-1">
                          Appointment #{transaction.appointmentId}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => viewDetails(transaction)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        {canRefund(transaction) && (
                          <button
                            onClick={() => handleRefundClick(transaction)}
                            disabled={refundingId === transaction.id}
                            className="text-orange-600 hover:text-orange-900 disabled:opacity-50"
                            title="Refund"
                          >
                            {refundingId === transaction.id ? (
                              <Spinner size="sm" />
                            ) : (
                              <RefreshCw size={18} />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Cards - Mobile */}
        <div className="md:hidden divide-y divide-slate-200">
          {loading ? (
            <div className="p-6 text-center">
              <Spinner size="lg" />
            </div>
          ) : (
            paginatedTransactions.map((transaction) => (
              <div key={transaction.id} className="p-4 hover:bg-slate-50">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-sm font-medium text-slate-900">
                      {formatDate(transaction.date)}
                    </div>
                    <div className="text-xs text-slate-500 font-mono mt-1">
                      {transaction.id}
                    </div>
                  </div>
                  {getStatusBadge(transaction.status)}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Amount:</span>
                    <span className="text-lg font-semibold text-slate-900">
                      ${formatAmount(transaction.amount)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Payment Method:</span>
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      {getPaymentMethodIcon(transaction.paymentMethod)}
                      <span className="capitalize">{transaction.paymentMethod}</span>
                    </div>
                  </div>

                  <div className="text-sm text-slate-900">
                    {transaction.description}
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-200">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => viewDetails(transaction)}
                    className="flex-1"
                  >
                    <Eye size={16} />
                    View Details
                  </Button>
                  {canRefund(transaction) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRefundClick(transaction)}
                      disabled={refundingId === transaction.id}
                      className="flex-1"
                    >
                      {refundingId === transaction.id ? (
                        <Spinner size="sm" />
                      ) : (
                        <>
                          <RefreshCw size={16} />
                          Refund
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-6 border-t border-slate-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Records Info */}
              <div className="text-sm text-slate-600">
                Showing <span className="font-medium">{startRecord}</span> to{' '}
                <span className="font-medium">{endRecord}</span> of{' '}
                <span className="font-medium">{sortedTransactions.length}</span> transactions
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center gap-2">
                {/* Page Size Selector */}
                <select
                  value={pageSize}
                  onChange={handlePageSizeChange}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                </select>

                {/* Page Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="First Page"
                  >
                    <ChevronsLeft size={18} />
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Previous Page"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <div className="px-4 py-2 text-sm font-medium text-slate-700">
                    Page {currentPage} of {totalPages}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Next Page"
                  >
                    <ChevronRight size={18} />
                  </button>
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Last Page"
                  >
                    <ChevronsRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Transaction Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Transaction Details"
        size="lg"
      >
        {selectedTransaction && (
          <div className="space-y-6">
            {/* Status Banner */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div>
                <div className="text-sm text-slate-600 mb-1">Status</div>
                {getStatusBadge(selectedTransaction.status)}
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-600 mb-1">Amount</div>
                <div className="text-2xl font-bold text-slate-900">
                  ${formatAmount(selectedTransaction.amount)}
                </div>
                <div className="text-xs text-slate-500">
                  {selectedTransaction.currency?.toUpperCase() || 'USD'}
                </div>
              </div>
            </div>

            {/* Transaction Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-slate-600 mb-1">Transaction ID</div>
                <div className="text-sm font-mono text-slate-900">
                  {selectedTransaction.id}
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-600 mb-1">Date & Time</div>
                <div className="text-sm text-slate-900">
                  {formatDate(selectedTransaction.date)} at {formatTime(selectedTransaction.date)}
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <div className="text-sm text-slate-600 mb-2">Payment Method</div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                {getPaymentMethodIcon(selectedTransaction.paymentMethod)}
                <div>
                  <div className="text-sm font-medium text-slate-900 capitalize">
                    {selectedTransaction.paymentMethod}
                  </div>
                  {selectedTransaction.cardLast4 && (
                    <div className="text-xs text-slate-500">
                      {selectedTransaction.cardBrand} •••• {selectedTransaction.cardLast4}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <div className="text-sm text-slate-600 mb-2">Description</div>
              <div className="text-sm text-slate-900">
                {selectedTransaction.description}
              </div>
              {selectedTransaction.appointmentId && (
                <div className="text-xs text-slate-500 mt-1">
                  Related to Appointment #{selectedTransaction.appointmentId}
                </div>
              )}
            </div>

            {/* Patient/Doctor Info */}
            {(selectedTransaction.patientName || selectedTransaction.doctorName) && (
              <div className="grid grid-cols-2 gap-4">
                {selectedTransaction.patientName && (
                  <div>
                    <div className="text-sm text-slate-600 mb-2">Patient</div>
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-slate-400" />
                      <span className="text-sm text-slate-900">
                        {selectedTransaction.patientName}
                      </span>
                    </div>
                  </div>
                )}
                {selectedTransaction.doctorName && (
                  <div>
                    <div className="text-sm text-slate-600 mb-2">Doctor</div>
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-slate-400" />
                      <span className="text-sm text-slate-900">
                        {selectedTransaction.doctorName}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Billing Address */}
            {selectedTransaction.billingAddress && (
              <div>
                <div className="text-sm text-slate-600 mb-2">Billing Address</div>
                <div className="space-y-1 text-sm text-slate-900">
                  {selectedTransaction.billingAddress.line1 && (
                    <div>{selectedTransaction.billingAddress.line1}</div>
                  )}
                  {selectedTransaction.billingAddress.line2 && (
                    <div>{selectedTransaction.billingAddress.line2}</div>
                  )}
                  <div>
                    {selectedTransaction.billingAddress.city}, {selectedTransaction.billingAddress.state}{' '}
                    {selectedTransaction.billingAddress.postal_code}
                  </div>
                  {selectedTransaction.billingAddress.country && (
                    <div>{selectedTransaction.billingAddress.country}</div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
              <Button variant="outline" className="flex-1">
                <FileText size={18} />
                Download Receipt
              </Button>
              {canRefund(selectedTransaction) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleRefundClick(selectedTransaction);
                  }}
                  disabled={refundingId === selectedTransaction.id}
                  className="flex-1"
                >
                  <RefreshCw size={18} />
                  Process Refund
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

PaymentHistory.propTypes = {
  transactions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      date: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]).isRequired,
      amount: PropTypes.number.isRequired,
      currency: PropTypes.string,
      paymentMethod: PropTypes.oneOf(['card', 'insurance', 'cash']).isRequired,
      cardBrand: PropTypes.string,
      cardLast4: PropTypes.string,
      status: PropTypes.oneOf(['completed', 'pending', 'failed', 'refunded']).isRequired,
      description: PropTypes.string.isRequired,
      appointmentId: PropTypes.string,
      patientName: PropTypes.string,
      doctorName: PropTypes.string,
      billingAddress: PropTypes.shape({
        line1: PropTypes.string,
        line2: PropTypes.string,
        city: PropTypes.string,
        state: PropTypes.string,
        postal_code: PropTypes.string,
        country: PropTypes.string,
      }),
    })
  ),
  currentUser: PropTypes.shape({
    role: PropTypes.string,
  }),
  onRefund: PropTypes.func,
  showFilters: PropTypes.bool,
  pageSize: PropTypes.number,
  onExport: PropTypes.func,
  enableRefunds: PropTypes.bool,
  onLoadMore: PropTypes.func,
  className: PropTypes.string,
};

export default PaymentHistory;
