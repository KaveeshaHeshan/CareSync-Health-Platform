import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Calendar,
  User,
  FileText,
  Phone,
  Mail,
  Activity,
  Download,
  Printer
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Card from '../../components/ui/Card';
import Alert from '../../components/ui/Alert';
import Skeleton from '../../components/ui/Skeleton';
import labApi from '../../api/labApi';

const TestOrderTable = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });

  // Test categories matching ResultUploader
  const testCategories = [
    'Blood Test',
    'Urine Test',
    'Imaging',
    'Biopsy',
    'Pathology',
    'Microbiology',
    'Genetic Testing',
    'Other'
  ];

  // Date filter options
  const dateFilterOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'custom', label: 'Custom Range' }
  ];

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, searchTerm, statusFilter, categoryFilter, dateFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await labApi.getTestOrders();
      setOrders(response.orders || []);
    } catch (error) {
      console.error('Error loading test orders:', error);
      showAlert('Failed to load test orders', 'error');
      // Mock data for development
      setOrders(getMockOrders());
    } finally {
      setLoading(false);
    }
  };

  const refreshOrders = async () => {
    try {
      setRefreshing(true);
      const response = await labApi.getTestOrders();
      setOrders(response.orders || []);
      showAlert('Orders refreshed successfully', 'success');
    } catch (error) {
      console.error('Error refreshing orders:', error);
      showAlert('Failed to refresh orders', 'error');
    } finally {
      setRefreshing(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...orders];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.patientId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(order => order.category === categoryFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const orderDate = (order) => new Date(order.orderDate);

      switch (dateFilter) {
        case 'today':
          filtered = filtered.filter(order => {
            const date = orderDate(order);
            return date.toDateString() === now.toDateString();
          });
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(order => orderDate(order) >= weekAgo);
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(order => orderDate(order) >= monthAgo);
          break;
      }
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

    setFilteredOrders(filtered);
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const handleCompleteOrder = (order) => {
    setSelectedOrder(order);
    setShowCompleteModal(true);
  };

  const confirmCompleteOrder = async () => {
    try {
      await labApi.updateTestOrderStatus(selectedOrder._id, 'completed');
      showAlert('Order marked as completed', 'success');
      setShowCompleteModal(false);
      refreshOrders();
    } catch (error) {
      console.error('Error completing order:', error);
      showAlert('Failed to complete order', 'error');
    }
  };

  const handleCancelOrder = (order) => {
    setSelectedOrder(order);
    setCancelReason('');
    setShowCancelModal(true);
  };

  const confirmCancelOrder = async () => {
    if (!cancelReason.trim()) {
      showAlert('Please provide a cancellation reason', 'error');
      return;
    }

    try {
      await labApi.updateTestOrderStatus(selectedOrder._id, 'cancelled', {
        reason: cancelReason
      });
      showAlert('Order cancelled successfully', 'success');
      setShowCancelModal(false);
      refreshOrders();
    } catch (error) {
      console.error('Error cancelling order:', error);
      showAlert('Failed to cancel order', 'error');
    }
  };

  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: 'success' }), 3000);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      'in-progress': 'info',
      completed: 'success',
      cancelled: 'error'
    };
    return colors[status] || 'default';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock size={16} />,
      'in-progress': <AlertCircle size={16} />,
      completed: <CheckCircle size={16} />,
      cancelled: <XCircle size={16} />
    };
    return icons[status] || <Activity size={16} />;
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Blood Test': 'bg-red-100 text-red-700 border-red-200',
      'Urine Test': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'Imaging': 'bg-blue-100 text-blue-700 border-blue-200',
      'Biopsy': 'bg-purple-100 text-purple-700 border-purple-200',
      'Pathology': 'bg-pink-100 text-pink-700 border-pink-200',
      'Microbiology': 'bg-green-100 text-green-700 border-green-200',
      'Genetic Testing': 'bg-indigo-100 text-indigo-700 border-indigo-200',
      'Other': 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOrderCounts = () => {
    return {
      all: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      'in-progress': orders.filter(o => o.status === 'in-progress').length,
      completed: orders.filter(o => o.status === 'completed').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length
    };
  };

  const counts = getOrderCounts();

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton height="200px" />
        <Skeleton height="400px" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alert */}
      {alert.show && (
        <Alert variant={alert.type} onClose={() => setAlert({ ...alert, show: false })}>
          {alert.message}
        </Alert>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Test Orders</h2>
          <p className="text-slate-600 mt-1">Manage and track lab test orders</p>
        </div>
        <Button
          onClick={refreshOrders}
          disabled={refreshing}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="text-sm text-slate-600">Total Orders</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{counts.all}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-slate-600">Pending</div>
          <div className="text-2xl font-bold text-yellow-600 mt-1">{counts.pending}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-slate-600">In Progress</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">{counts['in-progress']}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-slate-600">Completed</div>
          <div className="text-2xl font-bold text-green-600 mt-1">{counts.completed}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-slate-600">Cancelled</div>
          <div className="text-2xl font-bold text-red-600 mt-1">{counts.cancelled}</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search patient or test..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Categories</option>
            {testCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {dateFilterOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div className="mt-4 text-sm text-slate-600">
          Showing {filteredOrders.length} of {orders.length} orders
        </div>
      </Card>

      {/* Desktop Table View */}
      <Card className="hidden md:block overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Test Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Order Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <FileText size={48} className="mb-4" />
                      <p className="text-lg font-medium">No orders found</p>
                      <p className="text-sm mt-1">Try adjusting your filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr 
                    key={order._id} 
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => handleViewDetails(order)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                          {order.patientName.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900">
                            {order.patientName}
                          </div>
                          <div className="text-xs text-slate-500">
                            ID: {order.patientId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900">
                        {order.testName}
                      </div>
                      {order.priority && (
                        <div className="text-xs text-red-600 font-medium mt-1">
                          {order.priority} Priority
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${getCategoryColor(order.category)}`}>
                        {order.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">{formatDate(order.orderDate)}</div>
                      {order.expectedDate && (
                        <div className="text-xs text-slate-500 mt-1">
                          Expected: {new Date(order.expectedDate).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getStatusColor(order.status)} className="flex items-center gap-1 w-fit">
                        {getStatusIcon(order.status)}
                        <span className="capitalize">{order.status.replace('-', ' ')}</span>
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          onClick={() => handleViewDetails(order)}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          <Eye size={16} />
                          View
                        </Button>
                        {(order.status === 'pending' || order.status === 'in-progress') && (
                          <>
                            <Button
                              onClick={() => handleCompleteOrder(order)}
                              variant="success"
                              size="sm"
                              className="flex items-center gap-1"
                            >
                              <CheckCircle size={16} />
                              Complete
                            </Button>
                            <Button
                              onClick={() => handleCancelOrder(order)}
                              variant="danger"
                              size="sm"
                              className="flex items-center gap-1"
                            >
                              <XCircle size={16} />
                              Cancel
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {filteredOrders.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center justify-center text-slate-400">
              <FileText size={48} className="mb-4" />
              <p className="text-lg font-medium">No orders found</p>
              <p className="text-sm mt-1">Try adjusting your filters</p>
            </div>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order._id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-lg">
                    {order.patientName.charAt(0)}
                  </div>
                  <div className="ml-3">
                    <div className="font-semibold text-slate-900">{order.patientName}</div>
                    <div className="text-xs text-slate-500">ID: {order.patientId}</div>
                  </div>
                </div>
                <Badge variant={getStatusColor(order.status)} className="flex items-center gap-1">
                  {getStatusIcon(order.status)}
                  <span className="capitalize">{order.status.replace('-', ' ')}</span>
                </Badge>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <FileText size={16} className="text-slate-400" />
                  <span className="font-medium text-slate-900">{order.testName}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getCategoryColor(order.category)}`}>
                    {order.category}
                  </span>
                  {order.priority && (
                    <span className="text-xs text-red-600 font-medium">
                      {order.priority} Priority
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Calendar size={16} className="text-slate-400" />
                  <span>{formatDate(order.orderDate)}</span>
                </div>
                {order.expectedDate && (
                  <div className="text-xs text-slate-500">
                    Expected: {new Date(order.expectedDate).toLocaleDateString()}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => handleViewDetails(order)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 flex-1"
                >
                  <Eye size={16} />
                  View
                </Button>
                {(order.status === 'pending' || order.status === 'in-progress') && (
                  <>
                    <Button
                      onClick={() => handleCompleteOrder(order)}
                      variant="success"
                      size="sm"
                      className="flex items-center gap-1 flex-1"
                    >
                      <CheckCircle size={16} />
                      Complete
                    </Button>
                    <Button
                      onClick={() => handleCancelOrder(order)}
                      variant="danger"
                      size="sm"
                      className="flex items-center gap-1 flex-1"
                    >
                      <XCircle size={16} />
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <Modal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          title="Order Details"
        >
          <div className="space-y-6">
            {/* Order Status */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div>
                <div className="text-sm text-slate-600">Order ID</div>
                <div className="font-semibold text-slate-900 mt-1">{selectedOrder._id}</div>
              </div>
              <Badge variant={getStatusColor(selectedOrder.status)} className="flex items-center gap-1">
                {getStatusIcon(selectedOrder.status)}
                <span className="capitalize">{selectedOrder.status.replace('-', ' ')}</span>
              </Badge>
            </div>

            {/* Patient Information */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <User size={20} className="text-indigo-600" />
                Patient Information
              </h3>
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl">
                <div>
                  <div className="text-sm text-slate-600">Name</div>
                  <div className="font-medium text-slate-900 mt-1">{selectedOrder.patientName}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-600">Patient ID</div>
                  <div className="font-medium text-slate-900 mt-1">{selectedOrder.patientId}</div>
                </div>
                {selectedOrder.patientEmail && (
                  <div className="col-span-2">
                    <div className="text-sm text-slate-600">Email</div>
                    <div className="font-medium text-slate-900 mt-1 flex items-center gap-2">
                      <Mail size={16} className="text-slate-400" />
                      {selectedOrder.patientEmail}
                    </div>
                  </div>
                )}
                {selectedOrder.patientPhone && (
                  <div className="col-span-2">
                    <div className="text-sm text-slate-600">Phone</div>
                    <div className="font-medium text-slate-900 mt-1 flex items-center gap-2">
                      <Phone size={16} className="text-slate-400" />
                      {selectedOrder.patientPhone}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Test Information */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <FileText size={20} className="text-indigo-600" />
                Test Information
              </h3>
              <div className="space-y-3 p-4 bg-slate-50 rounded-xl">
                <div>
                  <div className="text-sm text-slate-600">Test Name</div>
                  <div className="font-medium text-slate-900 mt-1">{selectedOrder.testName}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-600">Category</div>
                  <div className="mt-1">
                    <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${getCategoryColor(selectedOrder.category)}`}>
                      {selectedOrder.category}
                    </span>
                  </div>
                </div>
                {selectedOrder.priority && (
                  <div>
                    <div className="text-sm text-slate-600">Priority</div>
                    <div className="font-medium text-red-600 mt-1">{selectedOrder.priority}</div>
                  </div>
                )}
                {selectedOrder.notes && (
                  <div>
                    <div className="text-sm text-slate-600">Notes</div>
                    <div className="text-sm text-slate-900 mt-1 whitespace-pre-wrap">
                      {selectedOrder.notes}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Dates */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Calendar size={20} className="text-indigo-600" />
                Timeline
              </h3>
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl">
                <div>
                  <div className="text-sm text-slate-600">Order Date</div>
                  <div className="font-medium text-slate-900 mt-1">{formatDate(selectedOrder.orderDate)}</div>
                </div>
                {selectedOrder.expectedDate && (
                  <div>
                    <div className="text-sm text-slate-600">Expected Completion</div>
                    <div className="font-medium text-slate-900 mt-1">
                      {new Date(selectedOrder.expectedDate).toLocaleDateString()}
                    </div>
                  </div>
                )}
                {selectedOrder.completedDate && (
                  <div className="col-span-2">
                    <div className="text-sm text-slate-600">Completed Date</div>
                    <div className="font-medium text-green-600 mt-1">
                      {formatDate(selectedOrder.completedDate)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-200">
              {(selectedOrder.status === 'pending' || selectedOrder.status === 'in-progress') && (
                <>
                  <Button
                    onClick={() => {
                      setShowDetailsModal(false);
                      handleCompleteOrder(selectedOrder);
                    }}
                    variant="success"
                    className="flex items-center gap-2 flex-1"
                  >
                    <CheckCircle size={18} />
                    Mark as Completed
                  </Button>
                  <Button
                    onClick={() => {
                      setShowDetailsModal(false);
                      handleCancelOrder(selectedOrder);
                    }}
                    variant="danger"
                    className="flex items-center gap-2 flex-1"
                  >
                    <XCircle size={18} />
                    Cancel Order
                  </Button>
                </>
              )}
              {selectedOrder.status === 'completed' && selectedOrder.resultUrl && (
                <Button
                  onClick={() => window.open(selectedOrder.resultUrl, '_blank')}
                  variant="primary"
                  className="flex items-center gap-2 flex-1"
                >
                  <Download size={18} />
                  Download Result
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Complete Order Modal */}
      {showCompleteModal && selectedOrder && (
        <Modal
          isOpen={showCompleteModal}
          onClose={() => setShowCompleteModal(false)}
          title="Complete Order"
        >
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-start gap-3">
                <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <div className="font-medium text-green-900">Confirm Completion</div>
                  <div className="text-sm text-green-700 mt-1">
                    Are you sure you want to mark this test order as completed?
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl">
              <div className="text-sm text-slate-600">Test Name</div>
              <div className="font-medium text-slate-900 mt-1">{selectedOrder.testName}</div>
              <div className="text-sm text-slate-600 mt-3">Patient</div>
              <div className="font-medium text-slate-900 mt-1">{selectedOrder.patientName}</div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => setShowCompleteModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmCompleteOrder}
                variant="success"
                className="flex-1 flex items-center justify-center gap-2"
              >
                <CheckCircle size={18} />
                Confirm Complete
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Cancel Order Modal */}
      {showCancelModal && selectedOrder && (
        <Modal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          title="Cancel Order"
        >
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-start gap-3">
                <XCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <div className="font-medium text-red-900">Cancel Test Order</div>
                  <div className="text-sm text-red-700 mt-1">
                    This action will cancel the test order. Please provide a reason.
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl">
              <div className="text-sm text-slate-600">Test Name</div>
              <div className="font-medium text-slate-900 mt-1">{selectedOrder.testName}</div>
              <div className="text-sm text-slate-600 mt-3">Patient</div>
              <div className="font-medium text-slate-900 mt-1">{selectedOrder.patientName}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Cancellation Reason *
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please explain why this order is being cancelled..."
                rows="4"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => setShowCancelModal(false)}
                variant="outline"
                className="flex-1"
              >
                Keep Order
              </Button>
              <Button
                onClick={confirmCancelOrder}
                variant="danger"
                className="flex-1 flex items-center justify-center gap-2"
              >
                <XCircle size={18} />
                Cancel Order
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// Mock data for development
const getMockOrders = () => {
  return [
    {
      _id: '1',
      patientId: 'P001',
      patientName: 'John Smith',
      patientEmail: 'john.smith@email.com',
      patientPhone: '+1 (555) 123-4567',
      testName: 'Complete Blood Count (CBC)',
      category: 'Blood Test',
      status: 'pending',
      priority: 'High',
      orderDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      expectedDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Patient is experiencing fatigue and dizziness. Urgent testing required.'
    },
    {
      _id: '2',
      patientId: 'P002',
      patientName: 'Sarah Johnson',
      patientEmail: 'sarah.j@email.com',
      patientPhone: '+1 (555) 234-5678',
      testName: 'Chest X-Ray',
      category: 'Imaging',
      status: 'in-progress',
      orderDate: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      expectedDate: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
      notes: 'Follow-up imaging for respiratory symptoms.'
    },
    {
      _id: '3',
      patientId: 'P003',
      patientName: 'Michael Brown',
      patientEmail: 'mbrown@email.com',
      patientPhone: '+1 (555) 345-6789',
      testName: 'Urinalysis',
      category: 'Urine Test',
      status: 'completed',
      orderDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      completedDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      resultUrl: '/results/urinalysis-003.pdf',
      notes: 'Routine check-up.'
    },
    {
      _id: '4',
      patientId: 'P004',
      patientName: 'Emily Davis',
      patientEmail: 'emily.davis@email.com',
      patientPhone: '+1 (555) 456-7890',
      testName: 'Blood Culture',
      category: 'Microbiology',
      status: 'pending',
      priority: 'Urgent',
      orderDate: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      expectedDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      notes: 'Suspected bacterial infection. Temperature 102°F.'
    },
    {
      _id: '5',
      patientId: 'P005',
      patientName: 'Robert Wilson',
      patientEmail: 'rwilson@email.com',
      patientPhone: '+1 (555) 567-8901',
      testName: 'MRI Brain Scan',
      category: 'Imaging',
      status: 'in-progress',
      orderDate: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      expectedDate: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
      notes: 'Chronic headaches, neurological examination required.'
    },
    {
      _id: '6',
      patientId: 'P006',
      patientName: 'Lisa Anderson',
      patientEmail: 'landerson@email.com',
      patientPhone: '+1 (555) 678-9012',
      testName: 'Lipid Panel',
      category: 'Blood Test',
      status: 'completed',
      orderDate: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
      completedDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      resultUrl: '/results/lipid-panel-006.pdf',
      notes: 'Routine cholesterol screening.'
    },
    {
      _id: '7',
      patientId: 'P007',
      patientName: 'James Martinez',
      patientEmail: 'jmartinez@email.com',
      patientPhone: '+1 (555) 789-0123',
      testName: 'Tissue Biopsy',
      category: 'Biopsy',
      status: 'cancelled',
      orderDate: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
      notes: 'Patient rescheduled for next week.'
    }
  ];
};

export default TestOrderTable;
