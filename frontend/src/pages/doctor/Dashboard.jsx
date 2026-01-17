import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import {
  Calendar,
  Clock,
  Users,
  Video,
  FileText,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Activity,
  DollarSign,
  Bell,
  ChevronRight,
  UserCheck,
  ClipboardList,
  Settings,
  BarChart3,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import doctorApi from '../../api/doctorApi';

/**
 * DoctorDashboard Component
 * 
 * Main dashboard for doctors showing appointments, patient queue,
 * statistics, and quick actions for daily workflow
 * 
 * @component
 */
const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [stats, setStats] = useState({
    todayTotal: 0,
    todayCompleted: 0,
    todayPending: 0,
    totalPatients: 0,
    weeklyRevenue: 0,
    averageRating: 0,
  });
  const [error, setError] = useState('');

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch today's appointments
      const todayResponse = await doctorApi.getTodayAppointments();
      setTodayAppointments(todayResponse.data || []);
      
      // Fetch upcoming appointments
      const upcomingResponse = await doctorApi.getUpcomingAppointments();
      setUpcomingAppointments(upcomingResponse.data?.slice(0, 5) || []);
      
      // Fetch dashboard stats
      const statsResponse = await doctorApi.getDashboardStats();
      setStats(statsResponse.data || stats);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Quick action cards
  const quickActions = [
    {
      id: 1,
      title: 'Appointment Queue',
      description: 'View today\'s appointments',
      icon: ClipboardList,
      color: 'indigo',
      count: stats.todayPending,
      path: '/doctor/appointments',
    },
    {
      id: 2,
      title: 'Patient Records',
      description: 'Access medical records',
      icon: FileText,
      color: 'blue',
      path: '/doctor/patients',
    },
    {
      id: 3,
      title: 'Video Consultation',
      description: 'Start video call',
      icon: Video,
      color: 'green',
      path: '/doctor/video-consultation',
    },
    {
      id: 4,
      title: 'Manage Schedule',
      description: 'Update availability',
      icon: Calendar,
      color: 'purple',
      path: '/doctor/schedule',
    },
  ];

  // Statistics cards
  const statisticsCards = [
    {
      id: 1,
      label: 'Today\'s Appointments',
      value: stats.todayTotal,
      subValue: `${stats.todayCompleted} completed`,
      icon: Calendar,
      color: 'blue',
      trend: '+12%',
    },
    {
      id: 2,
      label: 'Pending Consultations',
      value: stats.todayPending,
      subValue: 'Awaiting your review',
      icon: Clock,
      color: 'orange',
    },
    {
      id: 3,
      label: 'Total Patients',
      value: stats.totalPatients,
      subValue: 'Under your care',
      icon: Users,
      color: 'green',
      trend: '+5%',
    },
    {
      id: 4,
      label: 'Weekly Revenue',
      value: `$${stats.weeklyRevenue?.toLocaleString() || 0}`,
      subValue: 'This week',
      icon: DollarSign,
      color: 'purple',
      trend: '+8%',
    },
  ];

  // Format time
  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Get status badge color
  const getStatusColor = (status) => {
    const colors = {
      SCHEDULED: 'blue',
      CONFIRMED: 'green',
      IN_PROGRESS: 'yellow',
      COMPLETED: 'gray',
      CANCELLED: 'red',
    };
    return colors[status] || 'gray';
  };

  // Get status display text
  const getStatusText = (status) => {
    return status?.replace('_', ' ') || 'Unknown';
  };

  // Handle appointment action
  const handleStartConsultation = (appointmentId) => {
    navigate(`/doctor/consultation/${appointmentId}`);
  };

  const handleViewAppointment = (appointmentId) => {
    navigate(`/doctor/appointments/${appointmentId}`);
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, Dr. {user?.name || 'Doctor'}
        </h1>
        <p className="text-gray-600 mt-2">
          Here's what's happening with your practice today
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="error" className="mb-6">
          {error}
        </Alert>
      )}

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statisticsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.id} className="relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500">
                    {stat.subValue}
                  </p>
                  {stat.trend && (
                    <div className="flex items-center mt-2">
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-xs text-green-600 font-medium">
                        {stat.trend}
                      </span>
                    </div>
                  )}
                </div>
                <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Card
                key={action.id}
                className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
                onClick={() => navigate(action.path)}
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg bg-${action.color}-100`}>
                    <Icon className={`w-6 h-6 text-${action.color}-600`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">
                      {action.title}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {action.description}
                    </p>
                    {action.count !== undefined && (
                      <Badge variant="primary" className="mt-2">
                        {action.count} pending
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Today's Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Appointment Queue */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Today's Appointments
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/doctor/appointments')}
            >
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          
          {todayAppointments.length === 0 ? (
            <Card className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No appointments scheduled for today</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {todayAppointments.slice(0, 5).map((appointment) => (
                <Card
                  key={appointment.id}
                  className="hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      {/* Time Badge */}
                      <div className="bg-indigo-100 text-indigo-700 rounded-lg px-3 py-2 text-center min-w-[80px]">
                        <Clock className="w-4 h-4 mx-auto mb-1" />
                        <p className="text-sm font-semibold">
                          {formatTime(appointment.time)}
                        </p>
                      </div>
                      
                      {/* Patient Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-base font-semibold text-gray-900">
                            {appointment.patient?.name || 'Unknown Patient'}
                          </h3>
                          <Badge variant={getStatusColor(appointment.status)}>
                            {getStatusText(appointment.status)}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600 flex items-center">
                            <Activity className="w-4 h-4 mr-2 text-gray-400" />
                            {appointment.type || 'General Consultation'}
                          </p>
                          {appointment.reason && (
                            <p className="text-sm text-gray-500 line-clamp-1">
                              {appointment.reason}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex flex-col space-y-2 ml-4">
                      {appointment.status === 'CONFIRMED' && (
                        <Button
                          size="sm"
                          onClick={() => handleStartConsultation(appointment.id)}
                        >
                          <Video className="w-4 h-4 mr-2" />
                          Start
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewAppointment(appointment.id)}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming & Notifications */}
        <div className="space-y-6">
          {/* Upcoming Appointments */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Upcoming This Week
            </h2>
            <Card>
              {upcomingAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No upcoming appointments</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingAppointments.map((appointment, index) => (
                    <div
                      key={appointment.id}
                      className={`pb-3 ${
                        index < upcomingAppointments.length - 1 ? 'border-b border-gray-200' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {appointment.patient?.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(appointment.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-indigo-600">
                            {formatTime(appointment.time)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Recent Activity / Notifications */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Recent Activity
            </h2>
            <Card>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 rounded-full p-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      Appointment completed
                    </p>
                    <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 rounded-full p-2">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      New patient registered
                    </p>
                    <p className="text-xs text-gray-500 mt-1">5 hours ago</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-purple-100 rounded-full p-2">
                    <Calendar className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      Appointment rescheduled
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Yesterday</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Performance Overview */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Performance Overview
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/doctor/analytics')}
          >
            View Details
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Average Rating</p>
            <p className="text-3xl font-bold text-blue-600">
              {stats.averageRating?.toFixed(1) || '0.0'}
            </p>
            <p className="text-xs text-gray-500 mt-1">Out of 5.0</p>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Completion Rate</p>
            <p className="text-3xl font-bold text-green-600">
              {stats.todayTotal > 0
                ? Math.round((stats.todayCompleted / stats.todayTotal) * 100)
                : 0}%
            </p>
            <p className="text-xs text-gray-500 mt-1">Today's appointments</p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Active Patients</p>
            <p className="text-3xl font-bold text-purple-600">
              {stats.totalPatients || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">Under your care</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DoctorDashboard;
