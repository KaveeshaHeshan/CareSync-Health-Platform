import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Calendar,
  Download,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  BarChart3,
  PieChart,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Alert from '../../components/ui/Alert';
import Spinner from '../../components/ui/Spinner';
import adminApi from '../../api/adminApi';

const StripeAnalyticsChart = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [transactions, setTransactions] = useState([]);
  
  // Date filter
  const [dateRange, setDateRange] = useState('30days');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Calculate date range
      const endDate = new Date();
      let startDate = new Date();
      
      switch (dateRange) {
        case '7days':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30days':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90days':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case '1year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        case 'custom':
          if (customStartDate && customEndDate) {
            startDate = new Date(customStartDate);
            endDate.setTime(new Date(customEndDate).getTime());
          }
          break;
        default:
          startDate.setDate(endDate.getDate() - 30);
      }

      // Fetch analytics data
      const response = await adminApi.getPaymentAnalytics({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      setAnalytics(response.data || {});
      setTransactions(response.data?.recentTransactions || []);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data');
      
      // Mock data for development
      setAnalytics({
        totalRevenue: 45230.50,
        totalTransactions: 324,
        averageTransaction: 139.60,
        successRate: 97.5,
        previousRevenue: 38450.25,
        revenueGrowth: 17.6,
        paymentMethods: {
          card: 245,
          wallet: 58,
          bank: 21,
        },
        revenueByDay: [
          { date: '2026-01-10', amount: 1250 },
          { date: '2026-01-11', amount: 1580 },
          { date: '2026-01-12', amount: 1420 },
          { date: '2026-01-13', amount: 1890 },
          { date: '2026-01-14', amount: 1650 },
          { date: '2026-01-15', amount: 2100 },
          { date: '2026-01-16', amount: 1780 },
          { date: '2026-01-17', amount: 1950 },
        ],
      });
      
      setTransactions([
        {
          _id: '1',
          transactionId: 'TXN-2026-001',
          amount: 150,
          status: 'success',
          paymentMethod: 'card',
          patientName: 'John Doe',
          doctorName: 'Dr. Smith',
          createdAt: new Date().toISOString(),
        },
        {
          _id: '2',
          transactionId: 'TXN-2026-002',
          amount: 200,
          status: 'success',
          paymentMethod: 'wallet',
          patientName: 'Jane Smith',
          doctorName: 'Dr. Johnson',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          _id: '3',
          transactionId: 'TXN-2026-003',
          amount: 175,
          status: 'failed',
          paymentMethod: 'card',
          patientName: 'Mike Wilson',
          doctorName: 'Dr. Brown',
          createdAt: new Date(Date.now() - 7200000).toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const exportAnalytics = () => {
    const csvData = transactions.map((txn) => ({
      'Transaction ID': txn.transactionId,
      'Amount': `$${txn.amount.toFixed(2)}`,
      'Status': txn.status,
      'Payment Method': txn.paymentMethod,
      'Patient': txn.patientName,
      'Doctor': txn.doctorName,
      'Date': new Date(txn.createdAt).toLocaleDateString(),
    }));

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map((row) => Object.values(row).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status) => {
    const variants = {
      success: 'success',
      failed: 'danger',
      pending: 'warning',
      refunded: 'info',
    };
    return variants[status] || 'default';
  };

  const getPaymentMethodIcon = (method) => {
    return <CreditCard className="h-4 w-4" />;
  };

  // Calculate chart dimensions
  const maxRevenue = Math.max(...(analytics?.revenueByDay?.map((d) => d.amount) || [1]));
  const chartHeight = 200;

  if (loading) {
    return <Spinner size="lg" text="Loading analytics..." fullScreen />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-green-100 rounded-lg">
            <BarChart3 className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Payment Analytics
            </h2>
            <p className="text-sm text-gray-600">
              Stripe payment insights and revenue metrics
            </p>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button
            variant="secondary"
            size="sm"
            icon={Download}
            onClick={exportAnalytics}
            disabled={transactions.length === 0}
          >
            Export
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            onClick={fetchAnalytics}
            loading={loading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="error" closable onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Date Range Filter */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Date Range:</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {['7days', '30days', '90days', '1year'].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  dateRange === range
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {range === '7days' && 'Last 7 Days'}
                {range === '30days' && 'Last 30 Days'}
                {range === '90days' && 'Last 90 Days'}
                {range === '1year' && 'Last Year'}
              </button>
            ))}
            <button
              onClick={() => setDateRange('custom')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                dateRange === 'custom'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Custom Range
            </button>
          </div>

          {dateRange === 'custom' && (
            <div className="flex items-center space-x-2">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <Button size="sm" onClick={fetchAnalytics}>
                Apply
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <DollarSign className="h-5 w-5 text-green-600" />
                <p className="text-sm text-green-600 font-medium">Total Revenue</p>
              </div>
              <h3 className="text-2xl font-bold text-green-900">
                {formatCurrency(analytics?.totalRevenue || 0)}
              </h3>
              {analytics?.revenueGrowth !== undefined && (
                <div className="flex items-center space-x-1 mt-2">
                  {analytics.revenueGrowth >= 0 ? (
                    <ArrowUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <ArrowDown className="h-4 w-4 text-red-600" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      analytics.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {Math.abs(analytics.revenueGrowth).toFixed(1)}%
                  </span>
                  <span className="text-xs text-gray-600">vs previous period</span>
                </div>
              )}
            </div>
            <TrendingUp className="h-8 w-8 text-green-600 opacity-50" />
          </div>
        </Card>

        {/* Total Transactions */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <CreditCard className="h-5 w-5 text-blue-600" />
                <p className="text-sm text-blue-600 font-medium">Transactions</p>
              </div>
              <h3 className="text-2xl font-bold text-blue-900">
                {analytics?.totalTransactions || 0}
              </h3>
              <p className="text-xs text-blue-700 mt-2">Total payments processed</p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-600 opacity-50" />
          </div>
        </Card>

        {/* Average Transaction */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <DollarSign className="h-5 w-5 text-purple-600" />
                <p className="text-sm text-purple-600 font-medium">Average Transaction</p>
              </div>
              <h3 className="text-2xl font-bold text-purple-900">
                {formatCurrency(analytics?.averageTransaction || 0)}
              </h3>
              <p className="text-xs text-purple-700 mt-2">Per transaction</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600 opacity-50" />
          </div>
        </Card>

        {/* Success Rate */}
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <CheckCircle className="h-5 w-5 text-orange-600" />
                <p className="text-sm text-orange-600 font-medium">Success Rate</p>
              </div>
              <h3 className="text-2xl font-bold text-orange-900">
                {analytics?.successRate?.toFixed(1) || 0}%
              </h3>
              <p className="text-xs text-orange-700 mt-2">Payment success rate</p>
            </div>
            <CheckCircle className="h-8 w-8 text-orange-600 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <Card.Header>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
            <Badge variant="info">
              {analytics?.revenueByDay?.length || 0} days
            </Badge>
          </div>
        </Card.Header>
        <Card.Body>
          {analytics?.revenueByDay && analytics.revenueByDay.length > 0 ? (
            <div className="space-y-4">
              {/* Chart */}
              <div className="relative" style={{ height: chartHeight }}>
                <div className="flex items-end justify-between h-full space-x-2">
                  {analytics.revenueByDay.map((day, index) => {
                    const barHeight = (day.amount / maxRevenue) * chartHeight;
                    return (
                      <div
                        key={index}
                        className="flex-1 flex flex-col items-center justify-end group"
                      >
                        <div
                          className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg transition-all duration-300 hover:from-indigo-700 hover:to-indigo-500 relative group-hover:shadow-lg cursor-pointer"
                          style={{ height: `${barHeight}px` }}
                        >
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                            <div className="bg-gray-900 text-white text-xs rounded py-2 px-3 whitespace-nowrap">
                              <div className="font-semibold">
                                {formatCurrency(day.amount)}
                              </div>
                              <div className="text-gray-300">
                                {formatDate(day.date)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* X-axis labels */}
              <div className="flex items-center justify-between text-xs text-gray-600">
                {analytics.revenueByDay.map((day, index) => {
                  // Show only every nth label to avoid crowding
                  const showLabel =
                    index === 0 ||
                    index === analytics.revenueByDay.length - 1 ||
                    index % Math.ceil(analytics.revenueByDay.length / 6) === 0;
                  
                  return (
                    <div key={index} className="flex-1 text-center">
                      {showLabel && (
                        <span>
                          {new Date(day.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No revenue data available for the selected period
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Payment Methods Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods */}
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">
              Payment Methods
            </h3>
          </Card.Header>
          <Card.Body>
            {analytics?.paymentMethods ? (
              <div className="space-y-4">
                {Object.entries(analytics.paymentMethods).map(([method, count]) => {
                  const total = Object.values(analytics.paymentMethods).reduce(
                    (a, b) => a + b,
                    0
                  );
                  const percentage = ((count / total) * 100).toFixed(1);

                  return (
                    <div key={method} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <CreditCard className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-900 font-medium capitalize">
                            {method}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-600">{count} transactions</span>
                          <span className="text-indigo-600 font-semibold">
                            {percentage}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-indigo-600 to-indigo-400 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No payment method data available
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Quick Stats */}
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">Quick Stats</h3>
          </Card.Header>
          <Card.Body>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-900">
                    Successful Payments
                  </span>
                </div>
                <span className="text-lg font-bold text-green-600">
                  {Math.round(
                    (analytics?.totalTransactions || 0) * (analytics?.successRate || 0) / 100
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <span className="text-sm font-medium text-gray-900">
                    Failed Payments
                  </span>
                </div>
                <span className="text-lg font-bold text-red-600">
                  {(analytics?.totalTransactions || 0) -
                    Math.round(
                      (analytics?.totalTransactions || 0) * (analytics?.successRate || 0) / 100
                    )}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-900">
                    Previous Period Revenue
                  </span>
                </div>
                <span className="text-lg font-bold text-blue-600">
                  {formatCurrency(analytics?.previousRevenue || 0)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium text-gray-900">
                    Revenue Growth
                  </span>
                </div>
                <span
                  className={`text-lg font-bold ${
                    (analytics?.revenueGrowth || 0) >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {(analytics?.revenueGrowth || 0) >= 0 ? '+' : ''}
                  {(analytics?.revenueGrowth || 0).toFixed(1)}%
                </span>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
        </Card.Header>
        <Card.Body>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No transactions found for the selected period
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Transaction ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Patient
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Doctor
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Method
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.slice(0, 10).map((txn) => (
                    <tr key={txn._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {txn.transactionId}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {txn.patientName}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {txn.doctorName}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {formatCurrency(txn.amount)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          {getPaymentMethodIcon(txn.paymentMethod)}
                          <span className="capitalize">{txn.paymentMethod}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge variant={getStatusBadge(txn.status)}>
                          {txn.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        <div>
                          <div>{formatDate(txn.createdAt)}</div>
                          <div className="text-xs text-gray-500">
                            {formatTime(txn.createdAt)}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default StripeAnalyticsChart;
