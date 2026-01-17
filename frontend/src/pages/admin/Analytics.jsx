import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown,
  Users, 
  Calendar,
  DollarSign,
  Activity,
  Download,
  RefreshCw,
  Filter,
  BarChart3,
  PieChart,
  LineChart,
  ArrowUp,
  ArrowDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import adminApi from '../../api/adminApi';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('30days');
  const [activeChart, setActiveChart] = useState('revenue');

  // Analytics Data
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalRevenue: 125000,
      totalUsers: 2450,
      totalAppointments: 3890,
      activeUsers: 1850,
      revenueGrowth: 12.5,
      userGrowth: 8.3,
      appointmentGrowth: -2.1,
      activeUserGrowth: 15.2,
    },
    revenueByMonth: [
      { month: 'Jan', revenue: 8500, appointments: 245 },
      { month: 'Feb', revenue: 9200, appointments: 268 },
      { month: 'Mar', revenue: 10100, appointments: 289 },
      { month: 'Apr', revenue: 11500, appointments: 312 },
      { month: 'May', revenue: 10800, appointments: 298 },
      { month: 'Jun', revenue: 12500, appointments: 335 },
      { month: 'Jul', revenue: 13200, appointments: 356 },
      { month: 'Aug', revenue: 12900, appointments: 348 },
      { month: 'Sep', revenue: 14500, appointments: 389 },
      { month: 'Oct', revenue: 15200, appointments: 412 },
      { month: 'Nov', revenue: 16800, appointments: 445 },
      { month: 'Dec', revenue: 18500, appointments: 489 },
    ],
    userGrowth: [
      { month: 'Jan', patients: 180, doctors: 12 },
      { month: 'Feb', patients: 205, doctors: 15 },
      { month: 'Mar', patients: 238, doctors: 18 },
      { month: 'Apr', patients: 275, doctors: 22 },
      { month: 'May', patients: 298, doctors: 25 },
      { month: 'Jun', patients: 325, doctors: 28 },
      { month: 'Jul', patients: 356, doctors: 32 },
      { month: 'Aug', patients: 389, doctors: 35 },
      { month: 'Sep', patients: 412, doctors: 38 },
      { month: 'Oct', patients: 445, doctors: 42 },
      { month: 'Nov', patients: 478, doctors: 45 },
      { month: 'Dec', patients: 512, doctors: 48 },
    ],
    appointmentsByType: [
      { type: 'Online Consultation', count: 1580, percentage: 40.6 },
      { type: 'In-Person Visit', count: 2310, percentage: 59.4 },
    ],
    appointmentsByStatus: [
      { status: 'Completed', count: 2890, percentage: 74.3, color: 'text-green-600' },
      { status: 'Pending', count: 450, percentage: 11.6, color: 'text-yellow-600' },
      { status: 'Cancelled', count: 350, percentage: 9.0, color: 'text-red-600' },
      { status: 'Confirmed', count: 200, percentage: 5.1, color: 'text-blue-600' },
    ],
    topDoctors: [
      { name: 'Dr. Sarah Johnson', specialization: 'Cardiology', appointments: 245, revenue: 24500, rating: 4.9 },
      { name: 'Dr. Michael Chen', specialization: 'Pediatrics', appointments: 232, revenue: 23200, rating: 4.8 },
      { name: 'Dr. Emily Brown', specialization: 'Dermatology', appointments: 218, revenue: 21800, rating: 4.9 },
      { name: 'Dr. James Wilson', specialization: 'Neurology', appointments: 205, revenue: 20500, rating: 4.7 },
      { name: 'Dr. Lisa Davis', specialization: 'Orthopedics', appointments: 198, revenue: 19800, rating: 4.8 },
    ],
    revenueBySpecialization: [
      { specialization: 'Cardiology', revenue: 32500, percentage: 26.0 },
      { specialization: 'Pediatrics', revenue: 28900, percentage: 23.1 },
      { specialization: 'Dermatology', revenue: 24600, percentage: 19.7 },
      { specialization: 'Neurology', revenue: 21800, percentage: 17.4 },
      { specialization: 'Orthopedics', revenue: 17200, percentage: 13.8 },
    ],
    peakHours: [
      { hour: '9 AM', appointments: 145 },
      { hour: '10 AM', appointments: 198 },
      { hour: '11 AM', appointments: 225 },
      { hour: '12 PM', appointments: 189 },
      { hour: '2 PM', appointments: 212 },
      { hour: '3 PM', appointments: 234 },
      { hour: '4 PM', appointments: 198 },
      { hour: '5 PM', appointments: 167 },
    ],
  });

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAnalytics(dateRange);
      if (response.analytics) {
        setAnalyticsData(response.analytics);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
  };

  const exportAnalytics = () => {
    // Prepare CSV data
    const csvData = [
      ['CareSync Analytics Report'],
      [`Date Range: ${dateRange}`],
      [`Generated: ${new Date().toLocaleString()}`],
      [],
      ['Overview Metrics'],
      ['Metric', 'Value', 'Growth'],
      ['Total Revenue', `$${analyticsData.overview.totalRevenue.toLocaleString()}`, `${analyticsData.overview.revenueGrowth}%`],
      ['Total Users', analyticsData.overview.totalUsers, `${analyticsData.overview.userGrowth}%`],
      ['Total Appointments', analyticsData.overview.totalAppointments, `${analyticsData.overview.appointmentGrowth}%`],
      ['Active Users', analyticsData.overview.activeUsers, `${analyticsData.overview.activeUserGrowth}%`],
      [],
      ['Monthly Revenue'],
      ['Month', 'Revenue', 'Appointments'],
      ...analyticsData.revenueByMonth.map(item => [item.month, item.revenue, item.appointments]),
    ];

    const csv = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const renderTrendIcon = (growth) => {
    if (growth > 0) {
      return <ArrowUp className="text-green-600" size={20} />;
    } else if (growth < 0) {
      return <ArrowDown className="text-red-600" size={20} />;
    }
    return null;
  };

  const getTrendColor = (growth) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BarChart3 className="text-indigo-600" size={32} />
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Platform performance and insights</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={handleRefresh} 
            disabled={refreshing}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={refreshing ? 'animate-spin' : ''} size={20} />
            Refresh
          </Button>
          <Button onClick={exportAnalytics} className="flex items-center gap-2">
            <Download size={20} />
            Export Report
          </Button>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Date Range Filter */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <Filter size={20} className="text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Time Period:</span>
          <div className="flex gap-2">
            {['7days', '30days', '90days', '1year', 'all'].map((range) => (
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
                {range === 'all' && 'All Time'}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Total Revenue</p>
              <p className="text-3xl font-bold text-green-900 mt-2">
                ${analyticsData.overview.totalRevenue.toLocaleString()}
              </p>
              <div className={`flex items-center gap-1 mt-2 text-sm ${getTrendColor(analyticsData.overview.revenueGrowth)}`}>
                {renderTrendIcon(analyticsData.overview.revenueGrowth)}
                <span className="font-medium">
                  {Math.abs(analyticsData.overview.revenueGrowth)}%
                </span>
                <span className="text-gray-600">vs last period</span>
              </div>
            </div>
            <div className="p-3 bg-green-200 rounded-xl">
              <DollarSign className="text-green-700" size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Users</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">
                {analyticsData.overview.totalUsers.toLocaleString()}
              </p>
              <div className={`flex items-center gap-1 mt-2 text-sm ${getTrendColor(analyticsData.overview.userGrowth)}`}>
                {renderTrendIcon(analyticsData.overview.userGrowth)}
                <span className="font-medium">
                  {Math.abs(analyticsData.overview.userGrowth)}%
                </span>
                <span className="text-gray-600">vs last period</span>
              </div>
            </div>
            <div className="p-3 bg-blue-200 rounded-xl">
              <Users className="text-blue-700" size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Total Appointments</p>
              <p className="text-3xl font-bold text-purple-900 mt-2">
                {analyticsData.overview.totalAppointments.toLocaleString()}
              </p>
              <div className={`flex items-center gap-1 mt-2 text-sm ${getTrendColor(analyticsData.overview.appointmentGrowth)}`}>
                {renderTrendIcon(analyticsData.overview.appointmentGrowth)}
                <span className="font-medium">
                  {Math.abs(analyticsData.overview.appointmentGrowth)}%
                </span>
                <span className="text-gray-600">vs last period</span>
              </div>
            </div>
            <div className="p-3 bg-purple-200 rounded-xl">
              <Calendar className="text-purple-700" size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">Active Users</p>
              <p className="text-3xl font-bold text-orange-900 mt-2">
                {analyticsData.overview.activeUsers.toLocaleString()}
              </p>
              <div className={`flex items-center gap-1 mt-2 text-sm ${getTrendColor(analyticsData.overview.activeUserGrowth)}`}>
                {renderTrendIcon(analyticsData.overview.activeUserGrowth)}
                <span className="font-medium">
                  {Math.abs(analyticsData.overview.activeUserGrowth)}%
                </span>
                <span className="text-gray-600">vs last period</span>
              </div>
            </div>
            <div className="p-3 bg-orange-200 rounded-xl">
              <Activity className="text-orange-700" size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Chart Selector */}
      <Card className="p-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'revenue', name: 'Revenue Trends', icon: LineChart },
            { id: 'users', name: 'User Growth', icon: TrendingUp },
            { id: 'appointments', name: 'Appointment Status', icon: PieChart },
            { id: 'peak', name: 'Peak Hours', icon: Clock },
          ].map((chart) => {
            const Icon = chart.icon;
            return (
              <button
                key={chart.id}
                onClick={() => setActiveChart(chart.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  activeChart === chart.id
                    ? 'bg-indigo-600 text-white'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <Icon size={18} />
                {chart.name}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Revenue Trends Chart */}
      {activeChart === 'revenue' && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <LineChart size={24} />
            Revenue & Appointment Trends
          </h3>
          <div className="space-y-4">
            {/* Simple bar chart representation */}
            {analyticsData.revenueByMonth.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">{item.month}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-green-600 font-semibold">
                      ${item.revenue.toLocaleString()}
                    </span>
                    <span className="text-blue-600">
                      {item.appointments} appointments
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-green-500 to-green-600 h-full rounded-full transition-all"
                      style={{ width: `${(item.revenue / 20000) * 100}%` }}
                    />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all"
                      style={{ width: `${(item.appointments / 500) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* User Growth Chart */}
      {activeChart === 'users' && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <TrendingUp size={24} />
            User Growth by Type
          </h3>
          <div className="space-y-4">
            {analyticsData.userGrowth.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">{item.month}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-green-600 font-semibold">
                      {item.patients} patients
                    </span>
                    <span className="text-blue-600">
                      {item.doctors} doctors
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-green-500 to-green-600 h-full rounded-full transition-all"
                      style={{ width: `${(item.patients / 600) * 100}%` }}
                    />
                  </div>
                  <div className="w-32 bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all"
                      style={{ width: `${(item.doctors / 50) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Appointment Status Distribution */}
      {activeChart === 'appointments' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <PieChart size={24} />
              Appointment Status Distribution
            </h3>
            <div className="space-y-4">
              {analyticsData.appointmentsByStatus.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {item.status === 'Completed' && <CheckCircle className="text-green-600" size={20} />}
                      {item.status === 'Pending' && <Clock className="text-yellow-600" size={20} />}
                      {item.status === 'Cancelled' && <XCircle className="text-red-600" size={20} />}
                      {item.status === 'Confirmed' && <AlertCircle className="text-blue-600" size={20} />}
                      <span className="font-medium text-gray-700">{item.status}</span>
                    </div>
                    <div className="text-right">
                      <span className={`font-semibold ${item.color}`}>{item.count}</span>
                      <span className="text-sm text-gray-500 ml-2">({item.percentage}%)</span>
                    </div>
                  </div>
                  <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        item.status === 'Completed' ? 'bg-green-500' :
                        item.status === 'Pending' ? 'bg-yellow-500' :
                        item.status === 'Cancelled' ? 'bg-red-500' :
                        'bg-blue-500'
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Activity size={24} />
              Appointment Type Distribution
            </h3>
            <div className="space-y-4">
              {analyticsData.appointmentsByType.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-700">{item.type}</span>
                    <div className="text-right">
                      <span className="font-semibold text-indigo-600">{item.count}</span>
                      <span className="text-sm text-gray-500 ml-2">({item.percentage}%)</span>
                    </div>
                  </div>
                  <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-full rounded-full transition-all"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Peak Hours Chart */}
      {activeChart === 'peak' && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Clock size={24} />
            Peak Appointment Hours
          </h3>
          <div className="space-y-4">
            {analyticsData.peakHours.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700 w-20">{item.hour}</span>
                  <span className="text-indigo-600 font-semibold">
                    {item.appointments} appointments
                  </span>
                </div>
                <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full transition-all"
                    style={{ width: `${(item.appointments / 250) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Top Performing Doctors */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <TrendingUp size={24} />
          Top Performing Doctors
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Doctor</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Specialization</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Appointments</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Revenue</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Rating</th>
              </tr>
            </thead>
            <tbody>
              {analyticsData.topDoctors.map((doctor, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                        {doctor.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="font-medium text-gray-900">{doctor.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600">{doctor.specialization}</td>
                  <td className="py-4 px-4 text-right font-medium text-indigo-600">
                    {doctor.appointments}
                  </td>
                  <td className="py-4 px-4 text-right font-semibold text-green-600">
                    ${doctor.revenue.toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="inline-flex items-center gap-1 text-yellow-600 font-medium">
                      ⭐ {doctor.rating}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Revenue by Specialization */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <DollarSign size={24} />
          Revenue by Specialization
        </h3>
        <div className="space-y-4">
          {analyticsData.revenueBySpecialization.map((item, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-700">{item.specialization}</span>
                <div className="text-right">
                  <span className="font-semibold text-green-600">
                    ${item.revenue.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">({item.percentage}%)</span>
                </div>
              </div>
              <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-green-500 to-emerald-600 h-full rounded-full transition-all"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Analytics;
