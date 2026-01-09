import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Lock, ShieldCheck } from 'lucide-react';

// Logic & State Imports
import { useAuth } from '../../hooks/useAuth'; //
import { ROLES } from '../../utils/constants'; //

// UI Component (Feature-level)
import LoginForm from '../../features/auth/LoginForm';

const LoginPage = () => {
  const { isAuthenticated, user } = useAuth(); //
  const navigate = useNavigate();

  // 1. Auth Guard & Role-Based Redirection
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === ROLES.DOCTOR) navigate('/doctor/dashboard');
      else if (user.role === ROLES.ADMIN) navigate('/admin/dashboard');
      else navigate('/patient/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* --- Left Branding Section --- */}
      <div className="hidden lg:flex lg:w-1/2 bg-indigo-600 p-12 flex-col justify-between text-white">
        <div className="flex items-center gap-2">
          <div className="bg-white p-2 rounded-xl">
            <Activity className="text-indigo-600" size={24} />
          </div>
          <span className="text-2xl font-black tracking-tight">CareSync</span>
        </div>

        <div className="space-y-6">
          <h1 className="text-5xl font-bold leading-tight">
            Welcome Back to <br /> Your Health Hub.
          </h1>
          <p className="text-indigo-100 text-lg max-w-md">
            Securely access your medical records, upcoming appointments, 
            and communicate with your healthcare providers.
          </p>
          
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-indigo-300" size={24} />
              <span className="text-sm font-medium">HIPAA & GDPR Compliant Security</span>
            </div>
            <div className="flex items-center gap-3">
              <Lock className="text-indigo-300" size={24} />
              <span className="text-sm font-medium">End-to-End Encrypted Data</span>
            </div>
          </div>
        </div>

        <div className="text-sm text-indigo-200">
          Trusted by over 500+ Medical Institutions globally.
        </div>
      </div>

      {/* --- Right Login Form Section --- */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-black text-slate-900">Sign In</h2>
            <p className="text-slate-500 mt-2">
              Enter your credentials to access your secure portal.
            </p>
          </div>

          {/* Feature-level form handling the actual logic */}
          <LoginForm />

          <div className="text-center mt-8 space-y-4">
            <p className="text-sm text-slate-600">
              Don't have an account?{' '}
              <Link 
                to="/register" 
                className="text-indigo-600 font-bold hover:text-indigo-500 transition-colors"
              >
                Create an account
              </Link>
            </p>
            <p className="text-xs text-slate-400">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;