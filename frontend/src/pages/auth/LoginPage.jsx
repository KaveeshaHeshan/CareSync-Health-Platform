import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Lock, ShieldCheck, Heart, ArrowLeft, Home } from 'lucide-react';

// Logic & State Imports
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../utils/constants';

// UI Component (Feature-level)
import LoginForm from '../../features/auth/LoginForm';
import logo from '../../assets/logo1.png';
import banner from '../../assets/banner.jpg';

const LoginPage = () => {
  const { isAuthenticated, user } = useAuth();
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex flex-col lg:flex-row relative">
      {/* Back to Home Button */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm text-indigo-600 rounded-lg hover:bg-white transition-all shadow-md hover:shadow-lg group"
      >
        <Home className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="font-semibold">Back to Home</span>
      </Link>

      {/* --- Left Branding Section --- */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${banner})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/95 via-purple-600/90 to-indigo-800/95" />
        
        {/* Content */}
        <div className="relative p-12 flex flex-col justify-between text-white z-10 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src={logo} alt="CareSync" className="h-12 w-auto" />
            <span className="text-2xl font-black tracking-tight">CareSync</span>
          </div>

          {/* Main Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
              <Heart className="w-4 h-4" />
              <span>Trusted by 50,000+ Patients</span>
            </div>
            
            <h1 className="text-5xl font-bold leading-tight">
              Welcome Back to <br /> Your Health Hub.
            </h1>
            
            <p className="text-indigo-100 text-lg max-w-md leading-relaxed">
              Securely access your medical records, upcoming appointments, 
              and communicate with your healthcare providers.
            </p>
            
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-lg p-4">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                  <ShieldCheck className="text-white" size={20} />
                </div>
                <div>
                  <div className="font-semibold">Secure & Compliant</div>
                  <div className="text-sm text-indigo-200">HIPAA & GDPR Protected</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-lg p-4">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                  <Lock className="text-white" size={20} />
                </div>
                <div>
                  <div className="font-semibold">Encrypted Data</div>
                  <div className="text-sm text-indigo-200">End-to-End Protection</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-2 text-sm text-indigo-200">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-white/20 border-2 border-white" />
              <div className="w-8 h-8 rounded-full bg-white/20 border-2 border-white" />
              <div className="w-8 h-8 rounded-full bg-white/20 border-2 border-white" />
            </div>
            <span>Trusted by 500+ Medical Institutions globally</span>
          </div>
        </div>
      </div>

      {/* --- Right Login Form Section --- */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <img src={logo} alt="CareSync" className="h-12 w-auto" />
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              CareSync
            </span>
          </div>

          {/* Card Container */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-10 border border-gray-100">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-slate-900 mb-2">Welcome Back!</h2>
              <p className="text-slate-500">
                Sign in to access your health dashboard
              </p>
            </div>

            {/* Feature-level form handling the actual logic */}
            <LoginForm />

            <div className="mt-8 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">New to CareSync?</span>
                </div>
              </div>
              
              <p className="text-center text-sm text-slate-600">
                <Link 
                  to="/register" 
                  className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors hover:underline"
                >
                  Create a free account
                </Link>
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            By signing in, you agree to our{' '}
            <a href="#" className="text-indigo-600 hover:underline">Terms</a>
            {' '}and{' '}
            <a href="#" className="text-indigo-600 hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;