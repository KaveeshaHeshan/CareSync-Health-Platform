import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Award,
  DollarSign,
  Camera,
  Save,
  Lock,
  Settings,
  Calendar,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  Edit2,
  Eye,
  EyeOff,
  Shield,
  Bell,
  CreditCard,
  Building,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import doctorApi from '../../api/doctorApi';
import authApi from '../../api/authApi';
import { useAuth } from '../../hooks/useAuth';

/**
 * DoctorProfile Component
 * 
 * Complete profile management for doctors
 * Edit personal info, professional details, settings
 * 
 * @component
 */
const DoctorProfile = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('personal'); // personal, professional, security, settings
  
  // Profile data
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    specialization: '',
    experience: '',
    fees: '',
    qualification: '',
    about: '',
    languages: [],
    rating: 0,
    totalReviews: 0,
    profilePicture: '',
  });

  // Password change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Settings
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    appointmentReminders: true,
    marketingEmails: false,
    autoAcceptAppointments: false,
  });

  // Bank account details
  const [bankDetails, setBankDetails] = useState({
    accountHolderName: '',
    accountNumber: '',
    bankName: '',
    ifscCode: '',
    upiId: '',
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);

  // Fetch profile data
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await doctorApi.getProfile();
      if (response.data) {
        setProfile({
          ...profile,
          ...response.data,
          languages: response.data.languages || [],
        });
        
        if (response.data.settings) {
          setSettings({ ...settings, ...response.data.settings });
        }
        
        if (response.data.bankDetails) {
          setBankDetails({ ...bankDetails, ...response.data.bankDetails });
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  // Handle language toggle
  const handleLanguageToggle = (language) => {
    setProfile(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language]
    }));
  };

  // Save profile
  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setError('');
      
      await doctorApi.updateProfile(profile);
      
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Change password
  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setSaving(true);
      setError('');
      
      await doctorApi.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      
      setSuccess('Password changed successfully!');
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error changing password:', err);
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  // Save settings
  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      setError('');
      
      await doctorApi.updateSettings(settings);
      
      setSuccess('Settings updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to update settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Save bank details
  const handleSaveBankDetails = async () => {
    try {
      setSaving(true);
      setError('');
      
      await doctorApi.updateBankDetails(bankDetails);
      
      setSuccess('Bank details updated successfully!');
      setShowBankModal(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving bank details:', err);
      setError('Failed to update bank details. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Upload profile picture
  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await doctorApi.uploadProfilePicture(formData);
      setProfile(prev => ({ ...prev, profilePicture: response.data.url }));
      setSuccess('Profile picture updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error uploading profile picture:', err);
      setError('Failed to upload profile picture');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'professional', label: 'Professional', icon: Briefcase },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const commonLanguages = [
    'English', 'Hindi', 'Spanish', 'French', 'German',
    'Mandarin', 'Arabic', 'Portuguese', 'Russian', 'Japanese'
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
      </div>

      {/* Error & Success Alerts */}
      {error && (
        <Alert variant="error" className="mb-4" onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" className="mb-4" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            {/* Profile Picture */}
            <div className="text-center mb-6">
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                  {profile.profilePicture ? (
                    <img
                      src={profile.profilePicture}
                      alt={profile.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-16 h-16 text-white" />
                  )}
                </div>
                <label className="absolute bottom-4 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-50">
                  <Camera className="w-4 h-4 text-gray-600" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="hidden"
                  />
                </label>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{profile.name}</h3>
              <p className="text-sm text-gray-600">{profile.specialization}</p>
              <div className="flex items-center justify-center mt-2">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="ml-1 text-sm font-medium text-gray-900">{profile.rating}</span>
                <span className="ml-1 text-sm text-gray-500">({profile.totalReviews} reviews)</span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors
                      ${activeTab === tab.id
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-gray-600 hover:bg-gray-50'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Personal Info Tab */}
          {activeTab === 'personal' && (
            <Card>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-1">Personal Information</h2>
                <p className="text-sm text-gray-600">Update your personal details</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <Input
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleInputChange}
                    placeholder="Dr. John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleInputChange}
                    placeholder="doctor@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <Input
                    type="tel"
                    name="phone"
                    value={profile.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age
                  </label>
                  <Input
                    type="number"
                    name="age"
                    value={profile.age}
                    onChange={handleInputChange}
                    placeholder="35"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={profile.gender}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <Input
                    type="text"
                    name="city"
                    value={profile.city}
                    onChange={handleInputChange}
                    placeholder="New York"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <Input
                    type="text"
                    name="address"
                    value={profile.address}
                    onChange={handleInputChange}
                    placeholder="123 Medical Center Blvd"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <Input
                    type="text"
                    name="state"
                    value={profile.state}
                    onChange={handleInputChange}
                    placeholder="NY"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code
                  </label>
                  <Input
                    type="text"
                    name="zipCode"
                    value={profile.zipCode}
                    onChange={handleInputChange}
                    placeholder="10001"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t">
                <Button variant="outline" onClick={fetchProfile}>
                  Cancel
                </Button>
                <Button onClick={handleSaveProfile} disabled={saving}>
                  {saving ? <Spinner size="sm" className="mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Changes
                </Button>
              </div>
            </Card>
          )}

          {/* Professional Tab */}
          {activeTab === 'professional' && (
            <Card>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-1">Professional Details</h2>
                <p className="text-sm text-gray-600">Update your professional information</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specialization *
                  </label>
                  <Input
                    type="text"
                    name="specialization"
                    value={profile.specialization}
                    onChange={handleInputChange}
                    placeholder="Cardiologist"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience (years) *
                  </label>
                  <Input
                    type="text"
                    name="experience"
                    value={profile.experience}
                    onChange={handleInputChange}
                    placeholder="10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Consultation Fees ($) *
                  </label>
                  <Input
                    type="number"
                    name="fees"
                    value={profile.fees}
                    onChange={handleInputChange}
                    placeholder="150"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Qualification
                  </label>
                  <Input
                    type="text"
                    name="qualification"
                    value={profile.qualification}
                    onChange={handleInputChange}
                    placeholder="MBBS, MD"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    About
                  </label>
                  <textarea
                    name="about"
                    value={profile.about}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Tell patients about yourself, your experience, and your approach to care..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Languages Spoken
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {commonLanguages.map((language) => (
                      <button
                        key={language}
                        onClick={() => handleLanguageToggle(language)}
                        className={`
                          px-4 py-2 rounded-lg text-sm font-medium transition-colors
                          ${profile.languages.includes(language)
                            ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-500'
                            : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:border-gray-300'
                          }
                        `}
                      >
                        {language}
                        {profile.languages.includes(language) && (
                          <CheckCircle className="w-4 h-4 inline ml-1" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <Award className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
                      <div>
                        <h4 className="text-sm font-medium text-yellow-900 mb-1">
                          Payment Information
                        </h4>
                        <p className="text-sm text-yellow-700 mb-3">
                          Add your bank account details to receive payments
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowBankModal(true)}
                        >
                          <CreditCard className="w-4 h-4 mr-2" />
                          Manage Bank Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t">
                <Button variant="outline" onClick={fetchProfile}>
                  Cancel
                </Button>
                <Button onClick={handleSaveProfile} disabled={saving}>
                  {saving ? <Spinner size="sm" className="mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Changes
                </Button>
              </div>
            </Card>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <Card>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-1">Security Settings</h2>
                <p className="text-sm text-gray-600">Manage your account security</p>
              </div>

              <div className="space-y-6">
                {/* Password Section */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Password</h3>
                      <p className="text-sm text-gray-600">
                        Change your password regularly to keep your account secure
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Last changed: 30 days ago
                      </p>
                    </div>
                    <Button onClick={() => setShowPasswordModal(true)}>
                      <Lock className="w-4 h-4 mr-2" />
                      Change Password
                    </Button>
                  </div>
                </div>

                {/* Two-Factor Authentication */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Two-Factor Authentication
                      </h3>
                      <p className="text-sm text-gray-600">
                        Add an extra layer of security to your account
                      </p>
                      <Badge variant="gray" className="mt-2">Not Enabled</Badge>
                    </div>
                    <Button variant="outline">
                      Enable 2FA
                    </Button>
                  </div>
                </div>

                {/* Active Sessions */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Active Sessions</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Manage devices that are currently logged in to your account
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between bg-white p-4 rounded-lg">
                        <div className="flex items-center">
                          <div className="bg-green-100 p-2 rounded-lg mr-3">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Windows PC - Chrome
                            </p>
                            <p className="text-xs text-gray-500">
                              New York, USA • Current session
                            </p>
                          </div>
                        </div>
                        <Badge variant="success">Active</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <Card>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-1">Preferences</h2>
                <p className="text-sm text-gray-600">Manage your notification and application settings</p>
              </div>

              <div className="space-y-6">
                {/* Notifications */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                        <p className="text-sm text-gray-500">Receive email updates about your account</p>
                      </div>
                      <button
                        onClick={() => setSettings({ ...settings, emailNotifications: !settings.emailNotifications })}
                        className={`
                          w-12 h-6 rounded-full transition-colors relative
                          ${settings.emailNotifications ? 'bg-green-500' : 'bg-gray-300'}
                        `}
                      >
                        <span
                          className={`
                            absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform
                            ${settings.emailNotifications ? 'translate-x-6' : 'translate-x-0.5'}
                          `}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">SMS Notifications</p>
                        <p className="text-sm text-gray-500">Get text messages for important updates</p>
                      </div>
                      <button
                        onClick={() => setSettings({ ...settings, smsNotifications: !settings.smsNotifications })}
                        className={`
                          w-12 h-6 rounded-full transition-colors relative
                          ${settings.smsNotifications ? 'bg-green-500' : 'bg-gray-300'}
                        `}
                      >
                        <span
                          className={`
                            absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform
                            ${settings.smsNotifications ? 'translate-x-6' : 'translate-x-0.5'}
                          `}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Appointment Reminders</p>
                        <p className="text-sm text-gray-500">Get reminders for upcoming appointments</p>
                      </div>
                      <button
                        onClick={() => setSettings({ ...settings, appointmentReminders: !settings.appointmentReminders })}
                        className={`
                          w-12 h-6 rounded-full transition-colors relative
                          ${settings.appointmentReminders ? 'bg-green-500' : 'bg-gray-300'}
                        `}
                      >
                        <span
                          className={`
                            absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform
                            ${settings.appointmentReminders ? 'translate-x-6' : 'translate-x-0.5'}
                          `}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Marketing Emails</p>
                        <p className="text-sm text-gray-500">Receive promotional content and offers</p>
                      </div>
                      <button
                        onClick={() => setSettings({ ...settings, marketingEmails: !settings.marketingEmails })}
                        className={`
                          w-12 h-6 rounded-full transition-colors relative
                          ${settings.marketingEmails ? 'bg-green-500' : 'bg-gray-300'}
                        `}
                      >
                        <span
                          className={`
                            absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform
                            ${settings.marketingEmails ? 'translate-x-6' : 'translate-x-0.5'}
                          `}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Appointment Settings */}
                <div className="pt-6 border-t">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Appointment Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Auto-accept Appointments</p>
                        <p className="text-sm text-gray-500">Automatically confirm new appointment requests</p>
                      </div>
                      <button
                        onClick={() => setSettings({ ...settings, autoAcceptAppointments: !settings.autoAcceptAppointments })}
                        className={`
                          w-12 h-6 rounded-full transition-colors relative
                          ${settings.autoAcceptAppointments ? 'bg-green-500' : 'bg-gray-300'}
                        `}
                      >
                        <span
                          className={`
                            absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform
                            ${settings.autoAcceptAppointments ? 'translate-x-6' : 'translate-x-0.5'}
                          `}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t">
                <Button variant="outline" onClick={fetchProfile}>
                  Cancel
                </Button>
                <Button onClick={handleSaveSettings} disabled={saving}>
                  {saving ? <Spinner size="sm" className="mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Settings
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Change Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
          setError('');
        }}
        title="Change Password"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Choose a strong password with at least 6 characters
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <div className="relative">
              <Input
                type={showPasswords.current ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <Input
                type={showPasswords.new ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <Input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowPasswordModal(false);
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleChangePassword} disabled={saving}>
              {saving ? <Spinner size="sm" className="mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
              Change Password
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bank Details Modal */}
      <Modal
        isOpen={showBankModal}
        onClose={() => setShowBankModal(false)}
        title="Bank Account Details"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Add your bank account details to receive payments from consultations
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Holder Name
            </label>
            <Input
              type="text"
              value={bankDetails.accountHolderName}
              onChange={(e) => setBankDetails({ ...bankDetails, accountHolderName: e.target.value })}
              placeholder="Dr. John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Number
            </label>
            <Input
              type="text"
              value={bankDetails.accountNumber}
              onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
              placeholder="1234567890"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bank Name
            </label>
            <Input
              type="text"
              value={bankDetails.bankName}
              onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
              placeholder="Chase Bank"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Routing Number / IFSC Code
            </label>
            <Input
              type="text"
              value={bankDetails.ifscCode}
              onChange={(e) => setBankDetails({ ...bankDetails, ifscCode: e.target.value })}
              placeholder="CHAS0001234"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              UPI ID (Optional)
            </label>
            <Input
              type="text"
              value={bankDetails.upiId}
              onChange={(e) => setBankDetails({ ...bankDetails, upiId: e.target.value })}
              placeholder="doctor@bank"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setShowBankModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveBankDetails} disabled={saving}>
              {saving ? <Spinner size="sm" className="mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Save Details
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DoctorProfile;
