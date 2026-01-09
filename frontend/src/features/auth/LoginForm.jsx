import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

import Button from '../ui/Button';
import FormInput from '../shared/FormInput';
import NotificationToast from '../shared/NotificationToast';

// 1. Define the Validation Schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid medical email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  // 2. Initialize Hook Form
  const { register, handleSubmit, formState: { errors, isValid } } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onChange' // Validates as the user types
  });

  // 3. Handle Submit
  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(null);

    try {
      // MOCK API CALL - Replace with your actual auth service
      // await authService.login(data);
      console.log('Logging in with:', data);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Redirect to the page they tried to visit, or the dashboard
      const from = location.state?.from?.pathname || '/patient-dashboard';
      navigate(from, { replace: true });
      
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
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
          <button type="button" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
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

      {/* Footer link */}
      <p className="mt-8 text-center text-sm text-slate-500">
        Don't have an account?{' '}
        <button 
          onClick={() => navigate('/register')} 
          className="font-bold text-indigo-600 hover:underline"
        >
          Create an account
        </button>
      </p>
    </div>
  );
};

export default LoginForm;