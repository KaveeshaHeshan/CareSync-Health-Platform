import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, AlertCircle, ShieldCheck, Sparkles } from 'lucide-react';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import authApi from '../../api/authApi';

/**
 * LoginPage Component
 * 
 * User authentication page with email/password login
 * Handles login validation, API integration, and role-based redirects
 * 
 * @component
 */
const LoginPage = () => {
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user types
    if (error) setError('');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Call login API
      const response = await authApi.login({
        email: formData.email,
        password: formData.password,
      });

      // Redirect based on role
      const { user } = response;
      
      if (user.role === 'PATIENT') {
        navigate('/patient/dashboard');
      } else if (user.role === 'DOCTOR') {
        navigate('/doctor/dashboard');
      } else if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.message || 
        'Invalid email or password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Demo credentials helper
  const fillDemoCredentials = (role) => {
    const credentials = {
      patient: { email: 'patient@demo.com', password: 'password123' },
      doctor: { email: 'doctor@demo.com', password: 'password123' },
      admin: { email: 'admin@demo.com', password: 'password123' },
    };

    setFormData(credentials[role]);
  };

  return (
    <Card className="p-7 sm:p-8 rounded-2xl border border-slate-200/80 shadow-lg">
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          <ShieldCheck className="h-4 w-4" />
          Secure sign-in
        </div>
        <h1 className="mt-3 text-2xl font-bold text-slate-900">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-600">Sign in to continue to CareSync.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
            <AlertCircle size={20} className="shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
            Email Address
          </label>
          <Input
            id="email"
            type="email"
            name="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            icon={Mail}
            className="focus:border-violet-500 focus:ring-violet-500"
            disabled={loading}
            autoComplete="email"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
            Password
          </label>
          <Input
            id="password"
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            icon={Lock}
            className="focus:border-violet-500 focus:ring-violet-500"
            disabled={loading}
            autoComplete="current-password"
            showPasswordToggle
            required
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
              disabled={loading}
            />
            <span className="text-sm text-slate-700">Remember me</span>
          </label>

          <Link
            to="/forgot-password"
            className="text-sm font-medium text-violet-700 hover:text-violet-800 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:opacity-60"
        >
          {loading ? (
            <>
              <Spinner size="sm" />
              Signing in...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Sign in
            </>
          )}
        </button>
      </form>

      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs font-medium text-slate-500">DEMO</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <div className="space-y-3">
        <p className="text-center text-xs text-slate-600">Try demo accounts:</p>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => fillDemoCredentials('patient')}
            className="rounded-lg bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-800 hover:bg-violet-100 disabled:opacity-60"
            disabled={loading}
          >
            Patient
          </button>
          <button
            type="button"
            onClick={() => fillDemoCredentials('doctor')}
            className="rounded-lg bg-fuchsia-50 px-3 py-2 text-xs font-semibold text-fuchsia-800 hover:bg-fuchsia-100 disabled:opacity-60"
            disabled={loading}
          >
            Doctor
          </button>
          <button
            type="button"
            onClick={() => fillDemoCredentials('admin')}
            className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-200 disabled:opacity-60"
            disabled={loading}
          >
            Admin
          </button>
        </div>
      </div>

      <div className="mt-6 text-sm text-slate-600">
        Don’t have an account?{' '}
        <Link to="/register" className="font-medium text-violet-700 hover:text-violet-800 hover:underline">
          Create one
        </Link>
      </div>

      <div className="mt-3 text-sm">
        <Link to="/" className="text-slate-500 hover:text-slate-700">
          ← Back to Home
        </Link>
      </div>
    </Card>
  );
};

export default LoginPage;
