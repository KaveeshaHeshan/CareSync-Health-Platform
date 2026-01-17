import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';
import PublicLayout from './layouts/PublicLayout';

// Public Pages
import HomePage from './pages/HomePage';
import NotFound from './pages/NotFound';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Patient Pages
import PatientDashboard from './pages/patient/Dashboard';
import FindDoctors from './pages/patient/FindDoctors';
import DoctorProfile from './pages/patient/DoctorProfile';
import BookingDetails from './pages/patient/BookingDetails';
import BookingConfirmation from './pages/patient/BookingConfirmation';
import MyAppointments from './pages/patient/MyAppointments';
import VideoConsultation from './pages/patient/VideoConsultation';
import WaitingRoom from './pages/patient/WaitingRoom';
import MedicalRecords from './pages/patient/MedicalRecords';
import LabResults from './pages/patient/LabResults';
import Prescriptions from './pages/patient/Prescriptions';
import PatientBilling from './pages/patient/Billing';
import PatientProfile from './pages/patient/Profile';

// Doctor Pages
import DoctorDashboard from './pages/doctor/Dashboard';
import DoctorAppointments from './pages/doctor/Appointments';
import DoctorVideoConsultation from './pages/doctor/VideoConsultation';
import ConsultationHistory from './pages/doctor/ConsultationHistory';
import Patients from './pages/doctor/Patients';
import Schedule from './pages/doctor/Schedule';
import Earnings from './pages/doctor/Earnings';
import DoctorProfilePage from './pages/doctor/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import Users from './pages/admin/Users';
import Doctors from './pages/admin/Doctors';
import AdminAppointments from './pages/admin/Appointments';
import Analytics from './pages/admin/Analytics';
import Settings from './pages/admin/Settings';

// Billing Pages
import PaymentPage from './pages/billing/PaymentPage';
import InvoicePage from './pages/billing/InvoicePage';

// Components
import ProtectedRoute from './components/shared/ProtectedRoute';

// Hooks & Store
import useUserStore from './store/useUserStore';

// Styles
import './App.css';

function App() {
  const { user, isAuthenticated } = useUserStore();

  return (
    <BrowserRouter>
      <Routes>
        {/* ==================== PUBLIC ROUTES ==================== */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
        </Route>

        {/* ==================== AUTH ROUTES ==================== */}
        <Route element={<AuthLayout />}>
          <Route 
            path="/login" 
            element={
              isAuthenticated ? (
                <Navigate to={`/${user?.role?.toLowerCase()}/dashboard`} replace />
              ) : (
                <LoginPage />
              )
            } 
          />
          <Route 
            path="/register" 
            element={
              isAuthenticated ? (
                <Navigate to={`/${user?.role?.toLowerCase()}/dashboard`} replace />
              ) : (
                <RegisterPage />
              )
            } 
          />
        </Route>

        {/* ==================== PATIENT ROUTES ==================== */}
        <Route 
          path="/patient/*" 
          element={
            <ProtectedRoute allowedRoles={['PATIENT']}>
              <DashboardLayout userRole="patient" />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/patient/dashboard" replace />} />
          <Route path="dashboard" element={<PatientDashboard />} />
          <Route path="find-doctors" element={<FindDoctors />} />
          <Route path="doctor/:doctorId" element={<DoctorProfile />} />
          <Route path="booking/:doctorId" element={<BookingDetails />} />
          <Route path="booking-confirmation/:appointmentId" element={<BookingConfirmation />} />
          <Route path="appointments" element={<MyAppointments />} />
          <Route path="video-consultation/:appointmentId" element={<VideoConsultation />} />
          <Route path="waiting-room/:appointmentId" element={<WaitingRoom />} />
          <Route path="medical-records" element={<MedicalRecords />} />
          <Route path="lab-results" element={<LabResults />} />
          <Route path="prescriptions" element={<Prescriptions />} />
          <Route path="billing" element={<PatientBilling />} />
          <Route path="profile" element={<PatientProfile />} />
          <Route path="payment/:appointmentId" element={<PaymentPage />} />
          <Route path="invoice/:invoiceId" element={<InvoicePage />} />
        </Route>

        {/* ==================== DOCTOR ROUTES ==================== */}
        <Route 
          path="/doctor/*" 
          element={
            <ProtectedRoute allowedRoles={['DOCTOR']}>
              <DashboardLayout userRole="doctor" />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/doctor/dashboard" replace />} />
          <Route path="dashboard" element={<DoctorDashboard />} />
          <Route path="appointments" element={<DoctorAppointments />} />
          <Route path="video-consultation/:appointmentId" element={<DoctorVideoConsultation />} />
          <Route path="consultation-history" element={<ConsultationHistory />} />
          <Route path="patients" element={<Patients />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="earnings" element={<Earnings />} />
          <Route path="profile" element={<DoctorProfilePage />} />
        </Route>

        {/* ==================== ADMIN ROUTES ==================== */}
        <Route 
          path="/admin/*" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DashboardLayout userRole="admin" />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="doctors" element={<Doctors />} />
          <Route path="appointments" element={<AdminAppointments />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* ==================== FALLBACK ROUTES ==================== */}
        {/* Redirect root based on authentication */}
        <Route 
          path="/dashboard" 
          element={
            isAuthenticated ? (
              <Navigate to={`/${user?.role?.toLowerCase()}/dashboard`} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

        {/* 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
