import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Footer from '../components/shared/Footer';
import Button from '../components/ui/Button';

const PublicLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Public Header/Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
              C
            </div>
            <span className="text-2xl font-bold text-slate-800 tracking-tight">
              CareSync
            </span>
          </Link>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/find-doctor" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
              Find a Doctor
            </Link>
            <Link to="/services" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
              Services
            </Link>
            <Link to="/pricing" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
              Pricing
            </Link>
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                Log In
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" size="sm">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Page Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* 3. Footer */}
      <Footer />
    </div>
  );
};

export default PublicLayout;