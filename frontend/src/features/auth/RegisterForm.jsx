import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Phone, Calendar, UserCircle } from 'lucide-react';
import { useAuth } from './AuthContext';
import FormInput from '../../components/forms/FormInput';
import FormSelect from '../../components/forms/FormSelect';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';

const RegisterForm = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    age: '',
    gender: '',
    role: 'PATIENT',
    // Doctor-specific fields
    specialization: '',
    experience: '',
    fees: '',
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.phone && !/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Phone number is invalid';
    }

    if (formData.age && (formData.age < 1 || formData.age > 150)) {
      newErrors.age = 'Please enter a valid age';
    }

    // Doctor-specific validation
    if (formData.role === 'DOCTOR') {
      if (!formData.specialization) {
        newErrors.specialization = 'Specialization is required for doctors';
      }
      if (formData.fees && isNaN(formData.fees)) {
        newErrors.fees = 'Consultation fees must be a number';
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      // Prepare data for submission
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      };

      // Add optional fields if provided
      if (formData.phone) userData.phone = formData.phone;
      if (formData.age) userData.age = parseInt(formData.age);
      if (formData.gender) userData.gender = formData.gender;

      // Add doctor-specific fields
      if (formData.role === 'DOCTOR') {
        if (formData.specialization) userData.specialization = formData.specialization;
        if (formData.experience) userData.experience = formData.experience;
        if (formData.fees) userData.fees = parseFloat(formData.fees);
      }

      const response = await register(userData);

      // Redirect based on user role
      const role = response.user.role;
      switch (role) {
        case 'PATIENT':
          navigate('/patient/dashboard');
          break;
        case 'DOCTOR':
          navigate('/doctor/dashboard');
          break;
        case 'ADMIN':
          navigate('/admin/dashboard');
          break;
        default:
          navigate('/');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setApiError(
        error.response?.data?.message || 
        'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Other', label: 'Other' },
  ];

  const roleOptions = [
    { value: 'PATIENT', label: 'Patient' },
    { value: 'DOCTOR', label: 'Doctor' },
  ];

  const specializationOptions = [
    { value: 'Cardiology', label: 'Cardiology' },
    { value: 'Dermatology', label: 'Dermatology' },
    { value: 'Neurology', label: 'Neurology' },
    { value: 'Pediatrics', label: 'Pediatrics' },
    { value: 'Psychiatry', label: 'Psychiatry' },
    { value: 'Orthopedics', label: 'Orthopedics' },
    { value: 'General Physician', label: 'General Physician' },
    { value: 'ENT', label: 'ENT' },
    { value: 'Ophthalmology', label: 'Ophthalmology' },
    { value: 'Other', label: 'Other' },
  ];

  return (
    <div className="w-full max-w-2xl">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
          <p className="text-gray-600 mt-2">Join CareSync today</p>
        </div>

        {apiError && (
          <Alert variant="error" className="mb-6" closable onClose={() => setApiError('')}>
            {apiError}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              id="name"
              name="name"
              type="text"
              label="Full Name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              icon={User}
              required
              autoComplete="name"
            />

            <FormInput
              id="email"
              name="email"
              type="email"
              label="Email Address"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              icon={Mail}
              required
              autoComplete="email"
            />

            <FormInput
              id="password"
              name="password"
              type="password"
              label="Password"
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              icon={Lock}
              showPasswordToggle
              required
              autoComplete="new-password"
            />

            <FormInput
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              label="Confirm Password"
              placeholder="Re-enter password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              icon={Lock}
              showPasswordToggle
              required
              autoComplete="new-password"
            />

            <FormInput
              id="phone"
              name="phone"
              type="tel"
              label="Phone Number"
              placeholder="+1 234 567 8900"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
              icon={Phone}
              autoComplete="tel"
            />

            <FormInput
              id="age"
              name="age"
              type="number"
              label="Age"
              placeholder="25"
              value={formData.age}
              onChange={handleChange}
              error={errors.age}
              icon={Calendar}
              min="1"
              max="150"
            />

            <FormSelect
              id="gender"
              name="gender"
              label="Gender"
              placeholder="Select gender"
              value={formData.gender}
              onChange={handleChange}
              error={errors.gender}
              options={genderOptions}
              icon={UserCircle}
            />

            <FormSelect
              id="role"
              name="role"
              label="Register As"
              value={formData.role}
              onChange={handleChange}
              error={errors.role}
              options={roleOptions}
              icon={UserCircle}
              required
            />
          </div>

          {/* Doctor-specific fields */}
          {formData.role === 'DOCTOR' && (
            <div className="border-t pt-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Doctor Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormSelect
                  id="specialization"
                  name="specialization"
                  label="Specialization"
                  placeholder="Select specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  error={errors.specialization}
                  options={specializationOptions}
                  required
                />

                <FormInput
                  id="experience"
                  name="experience"
                  type="text"
                  label="Years of Experience"
                  placeholder="5 years"
                  value={formData.experience}
                  onChange={handleChange}
                  error={errors.experience}
                />

                <FormInput
                  id="fees"
                  name="fees"
                  type="number"
                  label="Consultation Fees ($)"
                  placeholder="50"
                  value={formData.fees}
                  onChange={handleChange}
                  error={errors.fees}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          )}

          <div className="flex items-start">
            <input
              type="checkbox"
              required
              className="h-4 w-4 mt-1 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label className="ml-2 text-sm text-gray-600">
              I agree to the{' '}
              <Link to="/terms" className="text-indigo-600 hover:text-indigo-700 font-medium">
                Terms & Conditions
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-indigo-600 hover:text-indigo-700 font-medium">
                Privacy Policy
              </Link>
            </label>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
