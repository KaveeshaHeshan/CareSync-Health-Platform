import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  Calendar,
  DollarSign,
  Activity,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  MoreVertical,
  Search,
  Filter,
  Download,
  RefreshCw,
  Bell,
  Settings,
  BarChart3,
  PieChart,
  FileText,
  UserPlus,
  Stethoscope,
  Building,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import adminApi from '../../api/adminApi';

/**
 * AdminDashboard Component
 * 
 * Main dashboard for system administrators
 * Overview of platform statistics, users, and activities
 * 
 * @component
 */
const AdminDashboard = () => {
  const navigate = useNavigate();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('today'); // today, week, month, year
  
  // Dashboard statistics
  const [statistics, setStatistics] = useState({
    totalUsers: 0,
    totalDoctors: 0,
    totalPatients: 0,
    activeAppointments: 0,
    completedAppointments: 0,
    totalRevenue: 0,
    pendingApprovals: 0,
    newRegistrations: 0,
  });

  // Trends (comparison with previous period)
  const [trends, setTrends] = useState({
    users: 0,
    appointments: 0,
    revenue: 0,
    doctors: 0,
  });

  // Recent activities
  const [recentActivities, setRecentActivities] = useState([]);
  
  // Pending doctor approvals
  const [pendingDoctors, setPendingDoctors] = useState([]);
  
  // Recent appointments
  const [recentAppointments, setRecentAppointments] = useState([]);

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, [selectedPeriod]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch all dashboard data in parallel
      const [statsResponse, activitiesResponse, doctorsResponse, appointmentsResponse] = await Promise.all([
        adminApi.getDashboardStats(selectedPeriod),
        adminApi.getRecentActivities(),
        adminApi.getPendingDoctors(),
        adminApi.getRecentAppointments({ limit: 5 }),
      ]);
      
      if (statsResponse.data) {
        setStatistics(statsResponse.data.statistics || statistics);
        setTrends(statsResponse.data.trends || trends);
      }
      
      setRecentActivities(activitiesResponse.data?.activities || []);
      setPendingDoctors(doctorsResponse.data?.doctors || []);
      setRecentAppointments(appointmentsResponse.data?.appointments || []);
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Refresh data
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Format number
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num || 0);
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

  // Get trend icon
  const getTrendIcon = (value) => {
    if (value > 0) {
      return <ArrowUpRight className="w-4 h-4 text-green-600" />;
    } else if (value < 0) {
      return <ArrowDownRight className="w-4 h-4 text-red-600" />;
    }
    return null;
  };

  // Get trend color
  const getTrendColor = (value) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  // Get activity icon
  const getActivityIcon = (type) => {
    switch (type) {
      case 'user_registration':
        return <UserPlus className="w-4 h-4 text-blue-600" />;
      case 'doctor_approval':
        return <UserCheck className="w-4 h-4 text-green-600" />;
      case 'appointment_created':
        return <Calendar className="w-4 h-4 text-purple-600" />;
      case 'appointment_completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'payment_received':
        return <DollarSign className="w-4 h-4 text-yellow-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  // Get status badge variant
  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'confirmed':
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
      case 'rejected':
        return 'danger';
      default:
        return 'gray';
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
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with CareSync</p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button onClick={() => navigate('/admin/settings')}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="error" className="mb-4" onClose={() => setError('')}>
            {error}
          </Alert>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Total Users */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 mb-1 font-medium">Total Users</p>
              <p className="text-3xl font-bold text-blue-900">{formatNumber(statistics.totalUsers)}</p>
              <div className="flex items-center mt-2">
                {getTrendIcon(trends.users)}
                <span className={`text-sm ml-1 ${getTrendColor(trends.users)}`}>
                  {Math.abs(trends.users)}% vs last period
                </span>
              </div>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        {/* Total Doctors */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 mb-1 font-medium">Total Doctors</p>
              <p className="text-3xl font-bold text-green-900">{formatNumber(statistics.totalDoctors)}</p>
              <div className="flex items-center mt-2">
                {getTrendIcon(trends.doctors)}
                <span className={`text-sm ml-1 ${getTrendColor(trends.doctors)}`}>
                  {Math.abs(trends.doctors)}% vs last period
                </span>
              </div>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        {/* Total Appointments */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700 mb-1 font-medium">Appointments</p>
              <p className="text-3xl font-bold text-purple-900">{formatNumber(statistics.activeAppointments)}</p>
              <div className="flex items-center mt-2">
                {getTrendIcon(trends.appointments)}
                <span className={`text-sm ml-1 ${getTrendColor(trends.appointments)}`}>
                  {Math.abs(trends.appointments)}% vs last period
                </span>
              </div>
            </div>
            <div className="bg-purple-500 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        {/* Total Revenue */}
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-700 mb-1 font-medium">Total Revenue</p>
              <p className="text-3xl font-bold text-yellow-900">{formatCurrency(statistics.totalRevenue)}</p>
              <div className="flex items-center mt-2">
                {getTrendIcon(trends.revenue)}
                <span className={`text-sm ml-1 ${getTrendColor(trends.revenue)}`}>
                  {Math.abs(trends.revenue)}% vs last period
                </span>
              </div>
            </div>
            <div className="bg-yellow-500 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Patients</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(statistics.totalPatients)}</p>
            </div>
            <Users className="w-8 h-8 text-gray-400" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Completed Today</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(statistics.completedAppointments)}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending Approvals</p>
              <p className="text-2xl font-bold text-yellow-600">{formatNumber(statistics.pendingApprovals)}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">New Registrations</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(statistics.newRegistrations)}</p>
            </div>
            <UserPlus className="w-8 h-8 text-blue-500" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pending Doctor Approvals */}
          {pendingDoctors.length > 0 && (
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <UserCheck className="w-5 h-5 mr-2 text-yellow-600" />
                    Pending Doctor Approvals
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">Review and approve new doctor registrations</p>
                </div>
                <Button variant="outline" onClick={() => navigate('/admin/doctors')}>
                  View All
                </Button>
              </div>

              <div className="space-y-3">
                {pendingDoctors.slice(0, 3).map((doctor) => (
                  <div key={doctor._id} className="flex items-center justify-between bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <div className="flex items-center flex-1">
                      <div className="w-12 h-12 rounded-full bg-yellow-200 flex items-center justify-center mr-4">
                        <Stethoscope className="w-6 h-6 text-yellow-700" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{doctor.name}</h3>
                        <p className="text-sm text-gray-600">{doctor.specialization}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {doctor.experience} years • {formatDate(doctor.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/doctors/${doctor._id}`)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {/* Handle approval */}}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Recent Appointments */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                  Recent Appointments
                </h2>
                <p className="text-sm text-gray-600 mt-1">Latest appointment bookings</p>
              </div>
              <Button variant="outline" onClick={() => navigate('/admin/appointments')}>
                View All
              </Button>
            </div>

            {recentAppointments.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No recent appointments</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentAppointments.map((appointment) => (
                      <tr key={appointment._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {appointment.patient?.name || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {appointment.doctor?.name || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <div>{formatDate(appointment.date)}</div>
                          <div className="text-xs text-gray-500">{appointment.time}</div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={getStatusVariant(appointment.status)}>
                            {appointment.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={appointment.type === 'online' ? 'info' : 'gray'}>
                            {appointment.type}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="lg:col-span-1 space-y-6">
          {/* Quick Actions */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/admin/users')}
              >
                <Users className="w-4 h-4 mr-2" />
                Manage Users
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/admin/doctors')}
              >
                <Stethoscope className="w-4 h-4 mr-2" />
                Approve Doctors
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/admin/appointments')}
              >
                <Calendar className="w-4 h-4 mr-2" />
                View Appointments
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/admin/analytics')}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/admin/settings')}
              >
                <Settings className="w-4 h-4 mr-2" />
                Platform Settings
              </Button>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              <Bell className="w-5 h-5 text-gray-400" />
            </div>

            {recentActivities.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivities.slice(0, 6).map((activity, index) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="bg-gray-100 p-2 rounded-lg">
                        {getActivityIcon(activity.type)}
                      </div>
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTime(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* System Status */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">System Status</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Platform Health</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-sm font-medium text-green-600">Operational</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API Status</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-sm font-medium text-green-600">Active</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-sm font-medium text-green-600">Connected</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Payment Gateway</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-sm font-medium text-green-600">Online</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
