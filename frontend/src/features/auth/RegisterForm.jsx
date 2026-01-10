import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  User, Mail, Lock, UserCircle, 
  Stethoscope, ArrowRight, ShieldCheck 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import Button from '../../components/ui/Button';
import FormInput from '../../components/forms/FormInput';
import FormSelect from '../../components/forms/FormSelect';
import NotificationToast from '../../components/shared/NotificationToast';
import authApi from '../../api/authApi';

// 1. Define the Validation Schema
const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['patient', 'doctor'], {
    errorMap: () => ({ message: 'Please select your role' }),
  }),
  // Conditional: Only required if role is doctor (validated in superRefine)
  licenseNumber: z.string().optional(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  confirmPassword: z.string()
}).superRefine((data, ctx) => {
  if (data.role === 'doctor') {
    const license = (data.licenseNumber ?? '').trim();
    if (license.length < 5) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Valid License Number is required for doctors',
        path: ['licenseNumber'],
      });
    }
  }

  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Passwords don't match",
      path: ['confirmPassword'],
    });
  }
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
      const payload = {
        name: data.fullName,
        email: data.email,
        password: data.password,
        role: (data.role || 'patient').toUpperCase(),
      };

      await authApi.register(payload);

      // Success! Redirect to login or onboarding
      navigate('/login', { state: { message: 'Account created! Please log in.' } });
    } catch (err) {
      const msg =
        err?.response?.data?.msg ||
        err?.response?.data?.message ||
        err?.message ||
        'Registration failed. This email may already be in use.';
      setError(msg);
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
    </div>
  );
};

export default RegisterForm;