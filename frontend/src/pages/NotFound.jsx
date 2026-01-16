import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search, FileQuestion } from 'lucide-react';
import Button from '../components/ui/Button';

/**
 * NotFound Component
 * 
 * 404 error page displayed when user navigates to non-existent route
 * Features illustration, helpful links, and navigation options
 * 
 * @component
 */
const NotFound = () => {
  const navigate = useNavigate();

  const quickLinks = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Login', path: '/login', icon: Search },
    { label: 'Register', path: '/register', icon: Search },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="relative inline-block">
            {/* Large 404 Text */}
            <div className="text-[150px] md:text-[200px] font-bold text-indigo-100 leading-none select-none">
              404
            </div>
            
            {/* Centered Icon */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-white shadow-xl flex items-center justify-center">
                <FileQuestion size={48} className="text-indigo-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Page Not Found
          </h1>
          <p className="text-xl text-slate-600 mb-2">
            Oops! The page you're looking for doesn't exist.
          </p>
          <p className="text-slate-500">
            It might have been moved, deleted, or the URL might be incorrect.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Button
            size="lg"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <ArrowLeft size={20} />
            Go Back
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <Home size={20} />
            Go to Homepage
          </Button>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Quick Links
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {quickLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <button
                  key={index}
                  onClick={() => navigate(link.path)}
                  className="flex items-center justify-center gap-3 p-4 rounded-xl border-2 border-slate-200 hover:border-indigo-600 hover:bg-indigo-50 transition-all duration-300 group"
                >
                  <Icon size={20} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                  <span className="font-medium text-slate-700 group-hover:text-indigo-600 transition-colors">
                    {link.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Help Text */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-sm text-slate-600">
              Need help? Contact our support team at{' '}
              <a
                href="mailto:support@caresync.com"
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                support@caresync.com
              </a>
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="mt-8 flex items-center justify-center gap-2 text-slate-400">
          <div className="w-12 h-px bg-slate-300"></div>
          <span className="text-sm">Error Code: 404</span>
          <div className="w-12 h-px bg-slate-300"></div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
