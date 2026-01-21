import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Mail,
  Lock,
  AlertCircle,
  User,
  Phone,
  Calendar,
  Stethoscope,
  CheckCircle,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import authApi from '../../api/authApi';

/**
 * RegisterPage Component
 * 
 * User registration page with role selection and multi-step form
 * Handles validation, API integration, and auto-login after registration
 * 
 * @component
 */
const RegisterPage = () => {
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    age: '',
    gender: '',
    role: 'PATIENT', // Default role
    // Doctor-specific fields
    specialization: '',
    experience: '',
    fees: '',
  });
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // Multi-step form

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

  // Handle role selection
  const selectRole = (role) => {
    setFormData((prev) => ({
      ...prev,
      role,
    }));
    setStep(2);
  };

  // Validate step 2
  const validateStep2 = () => {
    if (!formData.name.trim()) {
      setError('Please enter your full name');
      return false;
    }
    if (formData.name.trim().length < 3) {
      setError('Name must be at least 3 characters');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Please enter your email address');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.password) {
      setError('Please enter a password');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  // Handle next step
  const handleNextStep = () => {
    if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Final validation
    if (!formData.phone) {
      setError('Please enter your phone number');
      return;
    }
    if (!formData.age) {
      setError('Please enter your age');
      return;
    }
    if (!formData.gender) {
      setError('Please select your gender');
      return;
    }

    // Doctor-specific validation
    if (formData.role === 'DOCTOR') {
      if (!formData.specialization) {
        setError('Please enter your specialization');
        return;
      }
      if (!formData.experience) {
        setError('Please enter your years of experience');
        return;
      }
      if (!formData.fees) {
        setError('Please enter your consultation fees');
        return;
      }
    }

    try {
      setLoading(true);
      setError('');
      
      // Prepare registration data
      const registrationData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        age: parseInt(formData.age),
        gender: formData.gender,
        role: formData.role,
      };

      // Add doctor-specific fields
      if (formData.role === 'DOCTOR') {
        registrationData.specialization = formData.specialization;
        registrationData.experience = formData.experience;
        registrationData.fees = parseFloat(formData.fees);
      }

      // Call register API
      const response = await authApi.register(registrationData);

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
      console.error('Registration error:', err);
      setError(
        err.response?.data?.message || 
        'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Role selection step
  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Create your account</h2>
        <p className="mt-1 text-sm text-slate-600">Choose how you want to use CareSync.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => selectRole('PATIENT')}
          className="group relative rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-violet-500"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-700 transition group-hover:bg-violet-600 group-hover:text-white">
            <User size={22} />
          </div>
          <div className="mt-4">
            <div className="text-base font-semibold text-slate-900">Patient</div>
            <div className="mt-1 text-sm text-slate-600">Book appointments, consult doctors, and manage your records.</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => selectRole('DOCTOR')}
          className="group relative rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-fuchsia-50 text-fuchsia-700 transition group-hover:bg-fuchsia-600 group-hover:text-white">
            <Stethoscope size={22} />
          </div>
          <div className="mt-4">
            <div className="text-base font-semibold text-slate-900">Doctor</div>
            <div className="mt-1 text-sm text-slate-600">Manage your schedule, patients, and consultations.</div>
          </div>
        </button>
      </div>

      <div className="text-sm text-slate-600">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-violet-700 hover:text-violet-800 hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );

  // Basic information step
  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Account details</h2>
        <p className="mt-1 text-sm text-slate-600">
          {formData.role === 'DOCTOR' ? 'Join as a healthcare provider.' : 'Join CareSync in a few steps.'}
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800">
          <AlertCircle size={20} className="shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Name Input */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
          Full Name
        </label>
        <Input
          id="name"
          type="text"
          name="name"
          placeholder="John Doe"
          value={formData.name}
          onChange={handleChange}
          icon={User}
          className="focus:border-violet-500 focus:ring-violet-500"
          disabled={loading}
          required
        />
      </div>

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
          icon={Mail}
          className="focus:border-violet-500 focus:ring-violet-500"
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
        <Input
          id="password"
          type="password"
          name="password"
          placeholder="At least 6 characters"
          value={formData.password}
          onChange={handleChange}
          icon={Lock}
          className="focus:border-violet-500 focus:ring-violet-500"
          disabled={loading}
          autoComplete="new-password"
          showPasswordToggle
          required
        />
      </div>

      {/* Confirm Password Input */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
          Confirm Password
        </label>
        <Input
          id="confirmPassword"
          type="password"
          name="confirmPassword"
          placeholder="Re-enter your password"
          value={formData.confirmPassword}
          onChange={handleChange}
          icon={Lock}
          className="focus:border-violet-500 focus:ring-violet-500"
          disabled={loading}
          autoComplete="new-password"
          showPasswordToggle
          required
        />
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => setStep(1)}
          disabled={loading}
          className="flex-1 border-violet-300 text-violet-700 hover:bg-violet-50 focus:ring-violet-500"
        >
          Back
        </Button>
        <Button
          type="button"
          onClick={handleNextStep}
          disabled={loading}
          className="flex-1 bg-violet-600 hover:bg-violet-700 focus:ring-violet-500"
        >
          Continue
        </Button>
      </div>

      <div className="text-sm text-slate-600">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-violet-700 hover:text-violet-800 hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );

  // Additional details step
  const renderStep3 = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Complete your profile</h2>
        <p className="mt-1 text-sm text-slate-600">A few details to personalize your experience.</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800">
          <AlertCircle size={20} className="shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Phone Input */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
          Phone Number
        </label>
        <Input
          id="phone"
          type="tel"
          name="phone"
          placeholder="+1 (555) 123-4567"
          value={formData.phone}
          onChange={handleChange}
          icon={Phone}
          className="focus:border-violet-500 focus:ring-violet-500"
          disabled={loading}
          required
        />
      </div>

      {/* Age and Gender */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="age" className="block text-sm font-medium text-slate-700 mb-2">
            Age
          </label>
          <Input
            id="age"
            type="number"
            name="age"
            placeholder="25"
            value={formData.age}
            onChange={handleChange}
            icon={Calendar}
            className="focus:border-violet-500 focus:ring-violet-500"
            disabled={loading}
            min="1"
            max="120"
            required
          />
        </div>

        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-slate-700 mb-2">
            Gender
          </label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed"
            disabled={loading}
            required
          >
            <option value="">Select</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Doctor-specific fields */}
      {formData.role === 'DOCTOR' && (
        <>
          <div className="pt-4 border-t border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Professional Information
            </h3>
          </div>

          {/* Specialization */}
          <div>
            <label htmlFor="specialization" className="block text-sm font-medium text-slate-700 mb-2">
              Specialization
            </label>
            <Input
              id="specialization"
              type="text"
              name="specialization"
              placeholder="e.g., Cardiologist, Pediatrician"
              value={formData.specialization}
              onChange={handleChange}
              icon={Stethoscope}
              className="focus:border-violet-500 focus:ring-violet-500"
              disabled={loading}
              required
            />
          </div>

          {/* Experience and Fees */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="experience" className="block text-sm font-medium text-slate-700 mb-2">
                Experience (Years)
              </label>
              <Input
                id="experience"
                type="text"
                name="experience"
                placeholder="5"
                value={formData.experience}
                onChange={handleChange}
                className="focus:border-violet-500 focus:ring-violet-500"
                disabled={loading}
                required
              />
            </div>

            <div>
              <label htmlFor="fees" className="block text-sm font-medium text-slate-700 mb-2">
                Consultation Fee ($)
              </label>
              <Input
                id="fees"
                type="number"
                name="fees"
                placeholder="100"
                value={formData.fees}
                onChange={handleChange}
                className="focus:border-violet-500 focus:ring-violet-500"
                disabled={loading}
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>
        </>
      )}

      {/* Terms and Conditions */}
      <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
        <input
          type="checkbox"
          id="terms"
          className="mt-1 w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
          required
        />
        <label htmlFor="terms" className="text-sm text-slate-700">
          I agree to the{' '}
          <a href="#" className="text-violet-700 hover:text-violet-800 font-medium">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-violet-700 hover:text-violet-800 font-medium">
            Privacy Policy
          </a>
        </label>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => setStep(2)}
          disabled={loading}
          className="flex-1 border-violet-300 text-violet-700 hover:bg-violet-50 focus:ring-violet-500"
        >
          Back
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="flex-1 bg-violet-600 hover:bg-violet-700 focus:ring-violet-500"
        >
          {loading ? (
            <>
              <Spinner size="sm" />
              Creating account...
            </>
          ) : (
            <>
              <CheckCircle size={18} />
              Create Account
            </>
          )}
        </Button>
      </div>

      <div className="text-sm text-slate-600">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-violet-700 hover:text-violet-800 hover:underline">
          Sign in
        </Link>
      </div>
    </form>
  );

  const steps = [
    { key: 1, label: 'Role' },
    { key: 2, label: 'Account' },
    { key: 3, label: 'Profile' },
  ];

  return (
    <Card className="p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-sm">
      {/* Stepper */}
      <div className="mb-6 flex items-center gap-2">
        {steps.map((s, idx) => {
          const isActive = step === s.key;
          const isDone = step > s.key;
          return (
            <React.Fragment key={s.key}>
              <div
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                  isActive
                    ? 'bg-violet-600 text-white'
                    : isDone
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600'
                }`}
              >
                <span
                  className={`inline-flex h-5 w-5 items-center justify-center rounded-full ${
                    isActive || isDone ? 'bg-white/20 text-white' : 'bg-white text-slate-700'
                  }`}
                >
                  {s.key}
                </span>
                {s.label}
              </div>
              {idx !== steps.length - 1 && (
                <div className="h-px flex-1 bg-slate-200" />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </Card>
  );
};

export default RegisterPage;
