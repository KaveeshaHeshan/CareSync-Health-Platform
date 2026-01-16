import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
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
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white font-bold text-2xl mb-4 shadow-lg">
            C
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-slate-600">
            Sign in to your CareSync account
          </p>
        </div>

        {/* Login Card */}
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Alert */}
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800">
                <AlertCircle size={20} className="shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                leftIcon={<Mail size={18} />}
                disabled={loading}
                autoComplete="email"
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  leftIcon={<Lock size={18} />}
                  disabled={loading}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-slate-700">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size="sm" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="text-sm text-slate-500">OR</span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          {/* Demo Credentials */}
          <div className="space-y-3">
            <p className="text-xs text-center text-slate-600 mb-3">
              Try demo accounts:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillDemoCredentials('patient')}
                className="px-3 py-2 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                disabled={loading}
              >
                Patient
              </button>
              <button
                type="button"
                onClick={() => fillDemoCredentials('doctor')}
                className="px-3 py-2 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                disabled={loading}
              >
                Doctor
              </button>
              <button
                type="button"
                onClick={() => fillDemoCredentials('admin')}
                className="px-3 py-2 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                disabled={loading}
              >
                Admin
              </button>
            </div>
          </div>
        </Card>

        {/* Register Link */}
        <p className="text-center text-sm text-slate-600 mt-6">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Sign up for free
          </Link>
        </p>

        {/* Back to Home */}
        <div className="text-center mt-4">
          <Link
            to="/"
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
