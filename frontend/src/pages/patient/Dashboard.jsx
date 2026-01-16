import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Activity,
  Heart,
  TrendingUp,
  Video,
  FileText,
  Pill,
  Plus,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Users,
  Stethoscope,
  DollarSign,
  Bell,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import appointmentApi from '../../api/appointmentApi';
import { formatDate, formatTime } from '../../utils/formatters';

/**
 * PatientDashboard Component
 * 
 * Main dashboard for patients showing overview of health data, 
 * upcoming appointments, quick actions, and health metrics
 * 
 * @component
 */
const PatientDashboard = () => {
  const navigate = useNavigate();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [healthStats, setHealthStats] = useState({
    totalAppointments: 0,
    upcomingAppointments: 0,
    completedAppointments: 0,
    prescriptions: 0,
  });

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch upcoming appointments
      const response = await appointmentApi.getPatientAppointments({
        status: 'SCHEDULED',
        limit: 5,
      });
      
      setAppointments(response.appointments || []);
      
      // Calculate stats (in real app, fetch from backend)
      setHealthStats({
        totalAppointments: response.total || 0,
        upcomingAppointments: response.appointments?.length || 0,
        completedAppointments: 0, // Would come from API
        prescriptions: 0, // Would come from API
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Quick action cards
  const quickActions = [
    {
      id: 1,
      title: 'Find Doctors',
      description: 'Search and book appointments',
      icon: Stethoscope,
      color: 'indigo',
      path: '/patient/find-doctors',
    },
    {
      id: 2,
      title: 'Video Consultation',
      description: 'Start or join video call',
      icon: Video,
      color: 'green',
      path: '/patient/video-consultation',
    },
    {
      id: 3,
      title: 'Medical Records',
      description: 'View your health records',
      icon: FileText,
      color: 'blue',
      path: '/patient/medical-records',
    },
    {
      id: 4,
      title: 'Prescriptions',
      description: 'Manage your medications',
      icon: Pill,
      color: 'purple',
      path: '/patient/prescriptions',
    },
  ];

  // Health metrics (mock data)
  const healthMetrics = [
    {
      id: 1,
      label: 'Blood Pressure',
      value: '120/80',
      unit: 'mmHg',
      status: 'normal',
      icon: Heart,
      trend: 'stable',
    },
    {
      id: 2,
      label: 'Heart Rate',
      value: '72',
      unit: 'bpm',
      status: 'normal',
      icon: Activity,
      trend: 'stable',
    },
    {
      id: 3,
      label: 'Weight',
      value: '70',
      unit: 'kg',
      status: 'normal',
      icon: TrendingUp,
      trend: 'down',
    },
  ];

  // Get status badge color
  const getStatusColor = (status) => {
    const colors = {
      SCHEDULED: 'blue',
      CONFIRMED: 'green',
      PENDING: 'yellow',
      COMPLETED: 'green',
      CANCELLED: 'red',
    };
    return colors[status] || 'gray';
  };

  // Get appointment time status
  const getAppointmentTimeStatus = (dateTime) => {
    const now = new Date();
    const appointmentTime = new Date(dateTime);
    const diffMinutes = Math.floor((appointmentTime - now) / (1000 * 60));

    if (diffMinutes < 0) {
      return { label: 'Past', color: 'red' };
    } else if (diffMinutes < 15) {
      return { label: 'Starting Soon', color: 'orange' };
    } else if (diffMinutes < 60) {
      return { label: `In ${diffMinutes} min`, color: 'yellow' };
    } else {
      return { label: `In ${Math.floor(diffMinutes / 60)} hr`, color: 'blue' };
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome Back! 👋
          </h1>
          <p className="text-slate-600 mt-1">
            Here's an overview of your health today
          </p>
        </div>
        <Button
          onClick={() => navigate('/patient/find-doctors')}
          className="gap-2"
        >
          <Plus size={18} />
          Book Appointment
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Appointments */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">
                Total Appointments
              </p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {healthStats.totalAppointments}
              </p>
              <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                <TrendingUp size={14} />
                <span>+12% from last month</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
              <Calendar size={24} className="text-indigo-600" />
            </div>
          </div>
        </Card>

        {/* Upcoming Appointments */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">
                Upcoming
              </p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {healthStats.upcomingAppointments}
              </p>
              <p className="text-sm text-slate-500 mt-2">
                Next in 2 hours
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <Clock size={24} className="text-green-600" />
            </div>
          </div>
        </Card>

        {/* Completed */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">
                Completed
              </p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {healthStats.completedAppointments}
              </p>
              <p className="text-sm text-blue-600 mt-2 flex items-center gap-1">
                <CheckCircle size={14} />
                <span>All successful</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <CheckCircle size={24} className="text-blue-600" />
            </div>
          </div>
        </Card>

        {/* Prescriptions */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">
                Active Prescriptions
              </p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {healthStats.prescriptions}
              </p>
              <p className="text-sm text-orange-600 mt-2 flex items-center gap-1">
                <AlertCircle size={14} />
                <span>2 refills due</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <Pill size={24} className="text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Appointments and Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Appointments */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Upcoming Appointments
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Your scheduled consultations
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/patient/appointments')}
              >
                View All
                <ChevronRight size={16} />
              </Button>
            </div>

            {appointments.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <Calendar size={32} className="text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  No Upcoming Appointments
                </h3>
                <p className="text-slate-600 mb-6">
                  Book your first appointment with a doctor
                </p>
                <Button onClick={() => navigate('/patient/find-doctors')}>
                  <Plus size={18} />
                  Book Appointment
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((appointment) => {
                  const timeStatus = getAppointmentTimeStatus(appointment.dateTime);
                  
                  return (
                    <div
                      key={appointment._id}
                      className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                      onClick={() => navigate(`/patient/appointments/${appointment._id}`)}
                    >
                      {/* Doctor Avatar */}
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center text-white font-semibold shrink-0">
                        {appointment.doctorId?.name?.charAt(0) || 'D'}
                      </div>

                      {/* Appointment Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-900">
                            Dr. {appointment.doctorId?.name || 'Unknown'}
                          </h3>
                          <Badge color={getStatusColor(appointment.status)}>
                            {appointment.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">
                          {appointment.doctorId?.specialization || 'General Physician'}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {formatDate(appointment.dateTime)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {formatTime(appointment.dateTime)}
                          </span>
                        </div>
                      </div>

                      {/* Time Status Badge */}
                      <div>
                        <Badge color={timeStatus.color}>
                          {timeStatus.label}
                        </Badge>
                      </div>

                      {/* Join Button */}
                      {timeStatus.color === 'orange' || timeStatus.color === 'yellow' ? (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/patient/video-consultation?appointmentId=${appointment._id}`);
                          }}
                        >
                          <Video size={16} />
                          Join Now
                        </Button>
                      ) : (
                        <ChevronRight size={20} className="text-slate-400" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">
              Quick Actions
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={() => navigate(action.path)}
                    className="flex items-start gap-4 p-4 border-2 border-slate-200 rounded-xl hover:border-indigo-600 hover:shadow-lg transition-all duration-300 text-left group"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-${action.color}-100 flex items-center justify-center text-${action.color}-600 group-hover:bg-${action.color}-600 group-hover:text-white transition-colors shrink-0`}>
                      <Icon size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 mb-1">
                        {action.title}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {action.description}
                      </p>
                    </div>
                    <ChevronRight size={20} className="text-slate-400 group-hover:text-indigo-600 transition-colors shrink-0" />
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right Column - Health Metrics and Recent Activity */}
        <div className="space-y-6">
          {/* Health Metrics */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900">
                Health Metrics
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/patient/health-history')}
              >
                View History
              </Button>
            </div>
            <div className="space-y-4">
              {healthMetrics.map((metric) => {
                const Icon = metric.icon;
                return (
                  <div
                    key={metric.id}
                    className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl"
                  >
                    <div className={`w-10 h-10 rounded-lg ${
                      metric.status === 'normal' ? 'bg-green-100' : 'bg-red-100'
                    } flex items-center justify-center shrink-0`}>
                      <Icon size={20} className={
                        metric.status === 'normal' ? 'text-green-600' : 'text-red-600'
                      } />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-600">
                        {metric.label}
                      </p>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-xl font-bold text-slate-900">
                          {metric.value}
                        </span>
                        <span className="text-sm text-slate-500">
                          {metric.unit}
                        </span>
                      </div>
                    </div>
                    <Badge color={metric.status === 'normal' ? 'green' : 'red'}>
                      {metric.status === 'normal' ? 'Normal' : 'Alert'}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Notifications */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900">
                Notifications
              </h2>
              <Badge color="blue">3 New</Badge>
            </div>
            <div className="space-y-4">
              {/* Sample notifications */}
              <div className="flex gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <Bell size={18} className="text-blue-600 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">
                    Appointment Reminder
                  </p>
                  <p className="text-sm text-slate-600 mt-1">
                    You have an appointment with Dr. Smith in 2 hours
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    30 minutes ago
                  </p>
                </div>
              </div>

              <div className="flex gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle size={18} className="text-green-600 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">
                    Lab Results Available
                  </p>
                  <p className="text-sm text-slate-600 mt-1">
                    Your blood test results are now available
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    2 hours ago
                  </p>
                </div>
              </div>

              <div className="flex gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <AlertCircle size={18} className="text-orange-600 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">
                    Prescription Refill Due
                  </p>
                  <p className="text-sm text-slate-600 mt-1">
                    2 prescriptions need refills within 3 days
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    1 day ago
                  </p>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full mt-4"
              onClick={() => navigate('/patient/notifications')}
            >
              View All Notifications
            </Button>
          </Card>

          {/* Health Tips */}
          <Card className="p-6 bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <Heart size={20} />
              </div>
              <h2 className="text-xl font-semibold">
                Health Tip of the Day
              </h2>
            </div>
            <p className="text-white/90 mb-4">
              Stay hydrated! Aim to drink at least 8 glasses of water daily for optimal health and wellness.
            </p>
            <Button
              variant="outline"
              className="w-full border-white text-white hover:bg-white hover:text-indigo-600"
              size="sm"
            >
              Learn More
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
