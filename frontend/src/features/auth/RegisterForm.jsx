import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  User, Mail, Lock, UserCircle, 
  Stethoscope, ArrowRight, ShieldCheck 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import Button from '../ui/Button';
import FormInput from '../shared/FormInput';
import FormSelect from '../shared/FormSelect';
import NotificationToast from '../shared/NotificationToast';

// 1. Define the Validation Schema
const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['patient', 'doctor'], {
    errorMap: () => ({ message: 'Please select your role' }),
  }),
  // Conditional: Only required if role is doctor
  licenseNumber: z.string().optional().refine((val, ctx) => {
    if (ctx.parent?.role === 'doctor' && (!val || val.length < 5)) return false;
    return true;
  }, { message: 'Valid License Number is required for doctors' }),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const RegisterForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const { register, handleSubmit, watch, formState: { errors, isValid } } = useForm({
    resolver: zodResolver(registerSchema),
    mode: 'onChange'
  });

  // Watch the role to show/hide the License Number field
  const selectedRole = watch('role');

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Registering user:', data);
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Success! Redirect to login or onboarding
      navigate('/login', { state: { message: 'Account created! Please log in.' } });
    } catch (err) {
      setError('Registration failed. This email may already be in use.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {error && (
        <NotificationToast 
          type="error" 
          message="Registration Error" 
          description={error} 
          onClose={() => setError(null)} 
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name & Role Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            name="fullName"
            label="Full Name"
            placeholder="John Doe"
            icon={User}
            register={register}
            errors={errors}
          />
          <FormSelect
            name="role"
            label="I am a..."
            icon={UserCircle}
            options={[
              { value: 'patient', label: 'Patient' },
              { value: 'doctor', label: 'Doctor / Specialist' },
            ]}
            register={register}
            errors={errors}
          />
        </div>

        {/* Email Field */}
        <FormInput
          name="email"
          label="Email Address"
          placeholder="john@example.com"
          icon={Mail}
          register={register}
          errors={errors}
        />

        {/* Conditional Doctor Field */}
        {selectedRole === 'doctor' && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <FormInput
              name="licenseNumber"
              label="Medical License Number"
              placeholder="MED-12345678"
              icon={Stethoscope}
              register={register}
              errors={errors}
            />
          </div>
        )}

        {/* Password Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            name="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            icon={Lock}
            register={register}
            errors={errors}
          />
          <FormInput
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            icon={ShieldCheck}
            register={register}
            errors={errors}
          />
        </div>

        {/* Terms Disclaimer */}
        <p className="text-[11px] text-slate-500 leading-relaxed px-1">
          By clicking "Create Account", you agree to CareSync's 
          <span className="text-indigo-600 font-semibold cursor-pointer"> Terms of Service </span> 
          and <span className="text-indigo-600 font-semibold cursor-pointer"> Privacy Policy</span>.
        </p>

        <Button
          type="submit"
          className="w-full h-12"
          isLoading={isLoading}
          disabled={!isValid}
          icon={ArrowRight}
        >
          Create Account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <button 
          onClick={() => navigate('/login')} 
          className="font-bold text-indigo-600 hover:underline"
        >
          Sign In
        </button>
      </p>
    </div>
  );
};

export default RegisterForm;