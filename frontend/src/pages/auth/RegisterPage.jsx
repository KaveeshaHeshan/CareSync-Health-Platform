import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Activity } from 'lucide-react';

// Logic & State Imports
import { useAuth } from '../../hooks/useAuth'; //
import useUserStore from '../../store/useUserStore'; //

// UI Component (Feature-level)
import RegisterForm from '../../features/auth/RegisterForm'; 

const RegisterPage = () => {
  const { isAuthenticated } = useAuth(); //
  const navigate = useNavigate();

  // Redirect if user is already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/patient/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* 1. Left Section: Marketing/Trust Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-indigo-600 p-12 flex-col justify-between text-white">
        <div className="flex items-center gap-2">
          <div className="bg-white p-2 rounded-xl">
            <Activity className="text-indigo-600" size={24} />
          </div>
          <span className="text-2xl font-black tracking-tight">CareSync</span>
        </div>

        <div className="space-y-6">
          <h1 className="text-5xl font-bold leading-tight">
            Start Your Digital <br /> Health Journey Today.
          </h1>
          <p className="text-indigo-100 text-lg max-w-md">
            Join thousands of patients who manage their health records, 
            book appointments, and consult with doctors in one secure platform.
          </p>
          
          <div className="flex gap-8 pt-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-indigo-300" size={20} />
              <span className="text-sm font-medium">HIPAA Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="text-indigo-300" size={20} />
              <span className="text-sm font-medium">256-bit Encryption</span>
            </div>
          </div>
        </div>

        <div className="text-sm text-indigo-200">
          © 2026 CareSync Medical Systems. All rights reserved.
        </div>
      </div>

      {/* 2. Right Section: Registration Form Wrapper */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-black text-slate-900">Create Account</h2>
            <p className="text-slate-500 mt-2">
              Join the CareSync medical community.
            </p>
          </div>

          {/* The Actual Form Component from the Auth Feature */}
          <RegisterForm />

          <p className="text-center text-sm text-slate-600 mt-8">
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="text-indigo-600 font-bold hover:text-indigo-500 transition-colors"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;