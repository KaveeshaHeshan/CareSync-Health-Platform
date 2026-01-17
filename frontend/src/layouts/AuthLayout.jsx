import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Heart, Shield, Clock, Users } from 'lucide-react';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex">
      {/* Left Side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Heart className="text-white" size={24} />
            </div>
            <span className="text-2xl font-bold text-slate-800">CareSync</span>
          </Link>

          {/* Auth Form Content */}
          <Outlet />

          {/* Footer Links */}
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-600">
              By continuing, you agree to our{' '}
              <Link to="/terms" className="text-indigo-600 hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-indigo-600 hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Info Section */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-indigo-600 to-purple-600 p-12 text-white">
        <div className="flex flex-col justify-center max-w-xl mx-auto">
          <h1 className="text-4xl font-bold mb-6">
            Welcome to CareSync
          </h1>
          <p className="text-lg text-indigo-100 mb-12">
            Your trusted healthcare platform connecting patients with doctors for seamless medical consultations.
          </p>

          {/* Features */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Users size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Expert Doctors</h3>
                <p className="text-indigo-100">
                  Connect with certified healthcare professionals across various specializations.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">24/7 Availability</h3>
                <p className="text-indigo-100">
                  Book appointments anytime, anywhere with flexible scheduling options.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Secure & Private</h3>
                <p className="text-indigo-100">
                  Your health data is encrypted and protected with industry-standard security.
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-12 pt-12 border-t border-white/20">
            <div>
              <div className="text-3xl font-bold mb-1">500+</div>
              <div className="text-indigo-100 text-sm">Doctors</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">10K+</div>
              <div className="text-indigo-100 text-sm">Patients</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">50K+</div>
              <div className="text-indigo-100 text-sm">Consultations</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
