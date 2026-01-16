import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Choose Your Role
        </h2>
        <p className="text-slate-600">
          Select how you want to use CareSync
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Patient Role */}
        <button
          type="button"
          onClick={() => selectRole('PATIENT')}
          className="p-6 border-2 border-slate-200 rounded-xl hover:border-indigo-600 hover:shadow-lg transition-all duration-300 group text-left"
        >
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-indigo-100 text-indigo-600 mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <User size={24} />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            I'm a Patient
          </h3>
          <p className="text-sm text-slate-600">
            Book appointments, consult with doctors, and manage your health records
          </p>
        </button>

        {/* Doctor Role */}
        <button
          type="button"
          onClick={() => selectRole('DOCTOR')}
          className="p-6 border-2 border-slate-200 rounded-xl hover:border-green-600 hover:shadow-lg transition-all duration-300 group text-left"
        >
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-green-100 text-green-600 mb-4 group-hover:bg-green-600 group-hover:text-white transition-colors">
            <Stethoscope size={24} />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            I'm a Doctor
          </h3>
          <p className="text-sm text-slate-600">
            Manage appointments, consult with patients, and track your practice
          </p>
        </button>
      </div>
    </div>
  );

  // Basic information step
  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Create Your Account
        </h2>
        <p className="text-slate-600">
          {formData.role === 'DOCTOR' ? 'Join as a Healthcare Provider' : 'Join CareSync Today'}
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
          leftIcon={<User size={18} />}
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
            placeholder="At least 6 characters"
            value={formData.password}
            onChange={handleChange}
            leftIcon={<Lock size={18} />}
            disabled={loading}
            autoComplete="new-password"
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

      {/* Confirm Password Input */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
          Confirm Password
        </label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirmPassword"
            placeholder="Re-enter your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            leftIcon={<Lock size={18} />}
            disabled={loading}
            autoComplete="new-password"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            tabIndex={-1}
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => setStep(1)}
          disabled={loading}
          className="flex-1"
        >
          Back
        </Button>
        <Button
          type="button"
          onClick={handleNextStep}
          disabled={loading}
          className="flex-1"
        >
          Continue
        </Button>
      </div>
    </div>
  );

  // Additional details step
  const renderStep3 = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Complete Your Profile
        </h2>
        <p className="text-slate-600">
          Tell us a bit more about yourself
        </p>
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
          leftIcon={<Phone size={18} />}
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
            leftIcon={<Calendar size={18} />}
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
            className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed"
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
              leftIcon={<Stethoscope size={18} />}
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
          className="mt-1 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          required
        />
        <label htmlFor="terms" className="text-sm text-slate-700">
          I agree to the{' '}
          <a href="#" className="text-indigo-600 hover:text-indigo-700 font-medium">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-indigo-600 hover:text-indigo-700 font-medium">
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
          className="flex-1"
        >
          Back
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="flex-1"
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
    </form>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-2xl">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white font-bold text-2xl mb-4 shadow-lg">
            C
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Join CareSync
          </h1>
          <p className="text-slate-600">
            Create your account in just a few steps
          </p>
        </div>

        {/* Progress Indicator */}
        {step > 1 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">
                Step {step} of 3
              </span>
              <span className="text-sm text-slate-600">
                {Math.round((step / 3) * 100)}% Complete
              </span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Registration Card */}
        <Card className="p-8">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </Card>

        {/* Login Link */}
        <p className="text-center text-sm text-slate-600 mt-6">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Sign in
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

export default RegisterPage;
