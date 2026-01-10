import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 1. Layouts & Security - CORRECTED PATHS
import MainLayout from './layouts/MainLayout'; //
import ProtectedRoute from './components/auth/ProtectedRoute'; 
import { ROLES } from './utils/constants';

// 2. Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// 3. Patient Pages
import PatientDashboard from './pages/patient/Dashboard';
import BookingPage from './pages/patient/BookingPage';
import HistoryPage from './pages/patient/HistoryPage';
import LabResults from './pages/patient/LabResults';

// 4. Doctor Pages
import DoctorDashboard from './pages/doctor/Dashboard';
import SchedulePage from './pages/doctor/SchedulePage';

// 5. Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';

// 6. Billing Pages
import CheckoutPage from './pages/billing/CheckoutPage';
import SuccessPage from './pages/billing/SuccessPage';
import CancelPage from './pages/billing/CancelPage';

// 7. Fallback
import NotFound from './pages/NotFound';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* --- PUBLIC ROUTES --- */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* --- PATIENT PROTECTED ROUTES --- */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.PATIENT]} />}>
          <Route element={<MainLayout />}>
            <Route path="/patient-dashboard" element={<Navigate to="/patient/dashboard" replace />} />
            <Route path="/patient/dashboard" element={<PatientDashboard />} />
            <Route path="/patient/booking" element={<BookingPage />} />
            <Route path="/patient/history" element={<HistoryPage />} />
            <Route path="/patient/lab-results" element={<LabResults />} />
          </Route>
          
          <Route path="/billing/checkout" element={<CheckoutPage />} />
          <Route path="/billing/success" element={<SuccessPage />} />
          <Route path="/billing/cancel" element={<CancelPage />} />
        </Route>

        {/* --- DOCTOR PROTECTED ROUTES --- */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.DOCTOR]} />}>
          <Route element={<MainLayout />}>
            <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
            <Route path="/doctor/schedule" element={<SchedulePage />} />
          </Route>
        </Route>

        {/* --- ADMIN PROTECTED ROUTES --- */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
          <Route element={<MainLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>
        </Route>

        {/* --- GLOBAL REDIRECTS & 404 --- */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;