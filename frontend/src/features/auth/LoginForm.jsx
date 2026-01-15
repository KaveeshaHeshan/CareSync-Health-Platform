import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';

import Button from '../../components/ui/Button';
import FormInput from '../../components/forms/FormInput';
import NotificationToast from '../../components/shared/NotificationToast';

// 1. Define the Validation Schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid medical email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const { login, isLoading } = useAuth();
  
  const navigate = useNavigate();
  const location = useLocation();

  // 2. Initialize Hook Form
  const { register, handleSubmit, formState: { errors, isValid } } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onChange' // Validates as the user types
  });

  // 3. Handle Submit
  const onSubmit = async (data) => {
    setError(null);

    try {
      const response = await login(data);

      const rawFrom = location.state?.from?.pathname;
      const from = rawFrom === '/patient-dashboard' ? '/patient/dashboard' : rawFrom;

      const role = response?.user?.role;
      const fallback =
        role === 'DOCTOR'
          ? '/doctor/dashboard'
          : role === 'ADMIN'
            ? '/admin/dashboard'
            : '/patient/dashboard';

      // Redirect to the page they tried to visit, or a role-based dashboard.
      // Avoid redirecting back to auth pages.
      const destination = from && !from.startsWith('/login') && !from.startsWith('/register') ? from : fallback;
      navigate(destination, { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.msg ||
        err?.response?.data?.message ||
        err?.message ||
        'Invalid email or password. Please try again.';
      setError(msg);
    } finally {
      // isLoading is managed by AuthContext
    }
  };

  // 4. Handle Forgot Password
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
      setError('Please enter your email address');
      return;
    }
    
    try {
      // TODO: Implement actual password reset API call
      // await resetPassword(resetEmail);
      setResetSuccess(true);
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetSuccess(false);
        setResetEmail('');
      }, 3000);
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
    }
  };

  return (
    <div className="w-full">
      {/* Error Toast */}
      {error && (
        <NotificationToast 
          type="error" 
          message="Login Failed" 
          description={error} 
          onClose={() => setError(null)} 
        />
      )}

      {/* Success Toast */}
      {resetSuccess && (
        <NotificationToast 
          type="success" 
          message="Email Sent!" 
          description="Password reset instructions have been sent to your email." 
          onClose={() => setResetSuccess(false)} 
        />
      )}

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Reset Password</h3>
            <p className="text-slate-500 mb-6">
              Enter your email address and we'll send you instructions to reset your password.
            </p>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="name@hospital.com"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetEmail('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                >
                  Send Reset Link
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email Field */}
        <FormInput
          name="email"
          label="Email Address"
          placeholder="name@hospital.com"
          icon={Mail}
          register={register}
          errors={errors}
          disabled={isLoading}
        />

        {/* Password Field */}
        <div className="relative">
          <FormInput
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            icon={Lock}
            register={register}
            errors={errors}
            disabled={isLoading}
          />
          {/* Password Toggle */}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-[38px] text-slate-400 hover:text-indigo-600 transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* Remember & Forgot Password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input 
              type="checkbox" 
              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" 
            />
            <span className="text-sm text-slate-500 group-hover:text-slate-700 transition-colors">Remember me</span>
          </label>
          <button 
            type="button" 
            onClick={() => setShowForgotPassword(true)}
            className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors hover:underline"
          >
            Forgot password?
          </button>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-12 text-base"
          isLoading={isLoading}
          disabled={!isValid}
          icon={ArrowRight}
        >
          Sign In to CareSync
        </Button>
      </form>
    </div>
  );
};

export default LoginForm;