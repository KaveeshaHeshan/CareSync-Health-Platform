import React from 'react';
import { Heart, ShieldCheck, Zap } from 'lucide-react';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen w-full flex bg-white">
      
      {/* 1. Visual/Marketing Panel (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-50 p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative Background Element */}
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-[-5%] left-[-5%] w-64 h-64 bg-violet-100 rounded-full blur-3xl opacity-50" />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
            C
          </div>
          <span className="text-2xl font-bold text-slate-800">CareSync</span>
        </div>

        {/* Marketing Content */}
        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-extrabold text-slate-900 leading-tight mb-6">
            Connecting you to <span className="text-indigo-600">better health</span> in real-time.
          </h1>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-600 shrink-0">
                <Heart size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">AI-Powered Triage</h4>
                <p className="text-slate-500 text-sm">Instant symptoms check to guide you to the right care.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-600 shrink-0">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">Secure Records</h4>
                <p className="text-slate-500 text-sm">Your medical data is encrypted and managed with privacy first.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-600 shrink-0">
                <Zap size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">Fast Consultations</h4>
                <p className="text-slate-500 text-sm">Connect with specialists in minutes via secure video calls.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Attribution */}
        <p className="text-slate-400 text-sm relative z-10">
          © {new Date().getFullYear()} CareSync Health Systems.
        </p>
      </div>

      {/* 2. Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo (Visible only on small screens) */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                C
              </div>
              <span className="text-2xl font-bold text-slate-800">CareSync</span>
            </div>
          </div>

          {/* Form Header */}
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-2 text-slate-500 font-medium">
                {subtitle}
              </p>
            )}
          </div>

          {/* Actual Form Content (Login.jsx or Register.jsx) */}
          <div className="mt-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;