import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Save,
  X,
  Camera,
  Edit,
  Lock,
  Bell,
  Shield,
  Activity,
  Heart,
  AlertCircle,
  CheckCircle,
  Upload,
  Eye,
  EyeOff,
  Trash2,
  Info
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';

const Profile = () => {
  const navigate = useNavigate();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('personal'); // personal, medical, account
  
  // Personal information
  const [personalInfo, setPersonalInfo] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    dateOfBirth: '1990-05-15',
    age: 33,
    gender: 'Male',
    address: '123 Main Street, Apt 4B',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'United States'
  });

  // Medical profile
  const [medicalProfile, setMedicalProfile] = useState({
    bloodType: 'A+',
    height: '5\'10"',
    weight: '175 lbs',
    allergies: 'Penicillin, Peanuts',
    chronicConditions: 'Type 2 Diabetes, Hypertension',
    currentMedications: 'Metformin 500mg, Lisinopril 10mg',
    emergencyContactName: 'Jane Doe',
    emergencyContactPhone: '+1 (555) 987-6543',
    emergencyContactRelation: 'Spouse'
  });

  // Account settings
  const [accountSettings, setAccountSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    appointmentReminders: true,
    marketingEmails: false,
    twoFactorAuth: false
  });

  // Password change
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Avatar
  const [avatarUrl, setAvatarUrl] = useState('https://ui-avatars.com/api/?name=John+Doe&size=200&background=4f46e5&color=fff');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Validation errors
  const [errors, setErrors] = useState({});

  // Success message
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      // Data is already in state (mock data)
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const validatePersonalInfo = () => {
    const newErrors = {};
    
    if (!personalInfo.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!personalInfo.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(personalInfo.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!personalInfo.phone.trim()) {
      newErrors.phone = 'Phone is required';
    }
    
    if (!personalInfo.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }
    
    return newErrors;
  };

  const validateMedicalProfile = () => {
    const newErrors = {};
    
    if (!medicalProfile.emergencyContactName.trim()) {
      newErrors.emergencyContactName = 'Emergency contact name is required';
    }
    
    if (!medicalProfile.emergencyContactPhone.trim()) {
      newErrors.emergencyContactPhone = 'Emergency contact phone is required';
    }
    
    return newErrors;
  };

  const validatePasswordForm = () => {
    const newErrors = {};
    
    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!passwordForm.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    
    if (!passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    return newErrors;
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setAvatarUrl('https://ui-avatars.com/api/?name=John+Doe&size=200&background=4f46e5&color=fff');
  };

  const handleSavePersonalInfo = async () => {
    const validationErrors = validatePersonalInfo();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    try {
      setSaving(true);
      setErrors({});
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Upload avatar if changed
      if (avatarFile) {
        // Simulate upload
        await new Promise(resolve => setTimeout(resolve, 500));
        setAvatarUrl(avatarPreview);
        setAvatarFile(null);
        setAvatarPreview(null);
      }
      
      setSuccessMessage('Personal information updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving personal info:', error);
      alert('Failed to update personal information');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveMedicalProfile = async () => {
    const validationErrors = validateMedicalProfile();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    try {
      setSaving(true);
      setErrors({});
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccessMessage('Medical profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving medical profile:', error);
      alert('Failed to update medical profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAccountSettings = async () => {
    try {
      setSaving(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccessMessage('Account settings updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving account settings:', error);
      alert('Failed to update account settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    const validationErrors = validatePasswordForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    try {
      setSaving(true);
      setErrors({});
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setSuccessMessage('Password changed successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to original values (in real app, refetch from API)
    setErrors({});
    setSuccessMessage('');
  };

  const tabs = [
    { id: 'personal', label: 'Personal Information', icon: User },
    { id: 'medical', label: 'Medical Profile', icon: Activity },
    { id: 'account', label: 'Account Settings', icon: Shield }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-slate-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
              <p className="text-sm text-slate-600 mt-1">
                Manage your personal information and preferences
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-green-600" size={20} />
              <p className="text-green-800 font-medium">{successMessage}</p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              {/* Avatar */}
              <div className="text-center mb-6 pb-6 border-b border-slate-200">
                <div className="relative inline-block mb-4">
                  <img
                    src={avatarPreview || avatarUrl}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 bg-indigo-600 text-white w-10 h-10 rounded-full flex items-center justify-center cursor-pointer hover:bg-indigo-700 shadow-lg"
                  >
                    <Camera size={20} />
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <h3 className="text-xl font-bold text-slate-900">{personalInfo.name}</h3>
                <p className="text-sm text-slate-600">{personalInfo.email}</p>
                {avatarPreview && (
                  <div className="mt-3 flex gap-2">
                    <Button
                      onClick={handleRemoveAvatar}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <X size={14} className="mr-1" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-indigo-50 text-indigo-700 font-medium'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Icon size={20} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Personal Information Tab */}
            {activeTab === 'personal' && (
              <Card>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Personal Information</h2>

                <div className="space-y-6">
                  {/* Basic Info */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Basic Information</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Full Name <span className="text-red-600">*</span>
                        </label>
                        <Input
                          type="text"
                          value={personalInfo.name}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
                          placeholder="Enter your full name"
                        />
                        {errors.name && (
                          <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Email <span className="text-red-600">*</span>
                        </label>
                        <Input
                          type="email"
                          value={personalInfo.email}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                          placeholder="Enter your email"
                        />
                        {errors.email && (
                          <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Phone Number <span className="text-red-600">*</span>
                        </label>
                        <Input
                          type="tel"
                          value={personalInfo.phone}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                          placeholder="Enter your phone number"
                        />
                        {errors.phone && (
                          <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Date of Birth <span className="text-red-600">*</span>
                        </label>
                        <Input
                          type="date"
                          value={personalInfo.dateOfBirth}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, dateOfBirth: e.target.value })}
                        />
                        {errors.dateOfBirth && (
                          <p className="text-red-600 text-sm mt-1">{errors.dateOfBirth}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Gender
                        </label>
                        <select
                          value={personalInfo.gender}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, gender: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                          <option value="">Select gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Age
                        </label>
                        <Input
                          type="number"
                          value={personalInfo.age}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, age: e.target.value })}
                          placeholder="Enter your age"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Address</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Street Address
                        </label>
                        <Input
                          type="text"
                          value={personalInfo.address}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, address: e.target.value })}
                          placeholder="Enter street address"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          City
                        </label>
                        <Input
                          type="text"
                          value={personalInfo.city}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, city: e.target.value })}
                          placeholder="Enter city"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          State
                        </label>
                        <Input
                          type="text"
                          value={personalInfo.state}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, state: e.target.value })}
                          placeholder="Enter state"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          ZIP Code
                        </label>
                        <Input
                          type="text"
                          value={personalInfo.zipCode}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, zipCode: e.target.value })}
                          placeholder="Enter ZIP code"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Country
                        </label>
                        <Input
                          type="text"
                          value={personalInfo.country}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, country: e.target.value })}
                          placeholder="Enter country"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-6 border-t border-slate-200">
                    <Button
                      onClick={handleSavePersonalInfo}
                      disabled={saving}
                      className="flex-1 md:flex-initial"
                    >
                      {saving ? (
                        <>
                          <Spinner size="sm" className="mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2" size={20} />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      disabled={saving}
                    >
                      <X className="mr-2" size={20} />
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Medical Profile Tab */}
            {activeTab === 'medical' && (
              <Card>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Medical Profile</h2>

                <div className="space-y-6">
                  {/* Health Metrics */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Health Metrics</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Blood Type
                        </label>
                        <select
                          value={medicalProfile.bloodType}
                          onChange={(e) => setMedicalProfile({ ...medicalProfile, bloodType: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                          <option value="">Select blood type</option>
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Height
                        </label>
                        <Input
                          type="text"
                          value={medicalProfile.height}
                          onChange={(e) => setMedicalProfile({ ...medicalProfile, height: e.target.value })}
                          placeholder={'e.g., 5\'10"'}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Weight
                        </label>
                        <Input
                          type="text"
                          value={medicalProfile.weight}
                          onChange={(e) => setMedicalProfile({ ...medicalProfile, weight: e.target.value })}
                          placeholder="e.g., 175 lbs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Medical History */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Medical History</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Allergies
                        </label>
                        <textarea
                          value={medicalProfile.allergies}
                          onChange={(e) => setMedicalProfile({ ...medicalProfile, allergies: e.target.value })}
                          rows={3}
                          placeholder="List any allergies (medications, food, environmental)..."
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Chronic Conditions
                        </label>
                        <textarea
                          value={medicalProfile.chronicConditions}
                          onChange={(e) => setMedicalProfile({ ...medicalProfile, chronicConditions: e.target.value })}
                          rows={3}
                          placeholder="List any chronic conditions or ongoing health issues..."
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Current Medications
                        </label>
                        <textarea
                          value={medicalProfile.currentMedications}
                          onChange={(e) => setMedicalProfile({ ...medicalProfile, currentMedications: e.target.value })}
                          rows={3}
                          placeholder="List all current medications and dosages..."
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Emergency Contact</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Contact Name <span className="text-red-600">*</span>
                        </label>
                        <Input
                          type="text"
                          value={medicalProfile.emergencyContactName}
                          onChange={(e) => setMedicalProfile({ ...medicalProfile, emergencyContactName: e.target.value })}
                          placeholder="Enter emergency contact name"
                        />
                        {errors.emergencyContactName && (
                          <p className="text-red-600 text-sm mt-1">{errors.emergencyContactName}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Contact Phone <span className="text-red-600">*</span>
                        </label>
                        <Input
                          type="tel"
                          value={medicalProfile.emergencyContactPhone}
                          onChange={(e) => setMedicalProfile({ ...medicalProfile, emergencyContactPhone: e.target.value })}
                          placeholder="Enter emergency contact phone"
                        />
                        {errors.emergencyContactPhone && (
                          <p className="text-red-600 text-sm mt-1">{errors.emergencyContactPhone}</p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Relationship
                        </label>
                        <select
                          value={medicalProfile.emergencyContactRelation}
                          onChange={(e) => setMedicalProfile({ ...medicalProfile, emergencyContactRelation: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                          <option value="">Select relationship</option>
                          <option value="Spouse">Spouse</option>
                          <option value="Parent">Parent</option>
                          <option value="Sibling">Sibling</option>
                          <option value="Child">Child</option>
                          <option value="Friend">Friend</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex gap-3">
                      <Info className="text-blue-600 shrink-0" size={20} />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Important Medical Information</p>
                        <p>This information is crucial for emergency situations and proper medical care. Please keep it up to date.</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-6 border-t border-slate-200">
                    <Button
                      onClick={handleSaveMedicalProfile}
                      disabled={saving}
                      className="flex-1 md:flex-initial"
                    >
                      {saving ? (
                        <>
                          <Spinner size="sm" className="mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2" size={20} />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      disabled={saving}
                    >
                      <X className="mr-2" size={20} />
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Account Settings Tab */}
            {activeTab === 'account' && (
              <div className="space-y-6">
                {/* Change Password */}
                <Card>
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">Change Password</h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Current Password <span className="text-red-600">*</span>
                      </label>
                      <div className="relative">
                        <Input
                          type={showPasswords.current ? 'text' : 'password'}
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                      {errors.currentPassword && (
                        <p className="text-red-600 text-sm mt-1">{errors.currentPassword}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        New Password <span className="text-red-600">*</span>
                      </label>
                      <div className="relative">
                        <Input
                          type={showPasswords.new ? 'text' : 'password'}
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                      {errors.newPassword && (
                        <p className="text-red-600 text-sm mt-1">{errors.newPassword}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Confirm New Password <span className="text-red-600">*</span>
                      </label>
                      <div className="relative">
                        <Input
                          type={showPasswords.confirm ? 'text' : 'password'}
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>
                      )}
                    </div>

                    <Button
                      onClick={handleChangePassword}
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <Spinner size="sm" className="mr-2" />
                          Changing Password...
                        </>
                      ) : (
                        <>
                          <Lock className="mr-2" size={20} />
                          Change Password
                        </>
                      )}
                    </Button>
                  </div>
                </Card>

                {/* Notification Preferences */}
                <Card>
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">Notification Preferences</h2>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-slate-200">
                      <div className="flex items-center gap-3">
                        <Mail className="text-slate-600" size={20} />
                        <div>
                          <p className="font-medium text-slate-900">Email Notifications</p>
                          <p className="text-sm text-slate-600">Receive notifications via email</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={accountSettings.emailNotifications}
                          onChange={(e) => setAccountSettings({ ...accountSettings, emailNotifications: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-slate-200">
                      <div className="flex items-center gap-3">
                        <Phone className="text-slate-600" size={20} />
                        <div>
                          <p className="font-medium text-slate-900">SMS Notifications</p>
                          <p className="text-sm text-slate-600">Receive notifications via text message</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={accountSettings.smsNotifications}
                          onChange={(e) => setAccountSettings({ ...accountSettings, smsNotifications: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-slate-200">
                      <div className="flex items-center gap-3">
                        <Bell className="text-slate-600" size={20} />
                        <div>
                          <p className="font-medium text-slate-900">Appointment Reminders</p>
                          <p className="text-sm text-slate-600">Get reminders before appointments</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={accountSettings.appointmentReminders}
                          onChange={(e) => setAccountSettings({ ...accountSettings, appointmentReminders: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-slate-200">
                      <div className="flex items-center gap-3">
                        <Mail className="text-slate-600" size={20} />
                        <div>
                          <p className="font-medium text-slate-900">Marketing Emails</p>
                          <p className="text-sm text-slate-600">Receive promotional and marketing emails</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={accountSettings.marketingEmails}
                          onChange={(e) => setAccountSettings({ ...accountSettings, marketingEmails: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <Shield className="text-slate-600" size={20} />
                        <div>
                          <p className="font-medium text-slate-900">Two-Factor Authentication</p>
                          <p className="text-sm text-slate-600">Add extra security to your account</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={accountSettings.twoFactorAuth}
                          onChange={(e) => setAccountSettings({ ...accountSettings, twoFactorAuth: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    <div className="flex gap-3 pt-6 border-t border-slate-200">
                      <Button
                        onClick={handleSaveAccountSettings}
                        disabled={saving}
                        className="flex-1 md:flex-initial"
                      >
                        {saving ? (
                          <>
                            <Spinner size="sm" className="mr-2" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2" size={20} />
                            Save Settings
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
