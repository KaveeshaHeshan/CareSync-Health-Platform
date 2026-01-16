import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  MapPin,
  Star,
  Clock,
  DollarSign,
  Users,
  Video,
  Calendar,
  Award,
  Stethoscope,
  Heart,
  Brain,
  Baby,
  Eye,
  Bone,
  Pill,
  Activity,
  ChevronRight,
  X,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import axiosInstance from '../../api/axiosInstance';

/**
 * FindDoctors Component
 * 
 * Search and filter doctors by specialization, location, availability
 * Display doctor cards with ratings, fees, and booking options
 * 
 * @component
 */
const FindDoctors = () => {
  const navigate = useNavigate();
  
  // State management
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [selectedRating, setSelectedRating] = useState('');
  const [selectedFeeRange, setSelectedFeeRange] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Specializations with icons
  const specializations = [
    { id: 'all', name: 'All Specialties', icon: Stethoscope, color: 'slate' },
    { id: 'Cardiology', name: 'Cardiology', icon: Heart, color: 'red' },
    { id: 'Neurology', name: 'Neurology', icon: Brain, color: 'purple' },
    { id: 'Pediatrics', name: 'Pediatrics', icon: Baby, color: 'pink' },
    { id: 'Dermatology', name: 'Dermatology', icon: Activity, color: 'orange' },
    { id: 'Orthopedics', name: 'Orthopedics', icon: Bone, color: 'blue' },
    { id: 'Ophthalmology', name: 'Ophthalmology', icon: Eye, color: 'green' },
    { id: 'General Practice', name: 'General Practice', icon: Stethoscope, color: 'indigo' },
    { id: 'Dentistry', name: 'Dentistry', icon: Pill, color: 'cyan' },
  ];

  // Fee ranges
  const feeRanges = [
    { id: 'all', label: 'All Prices', min: 0, max: Infinity },
    { id: 'budget', label: 'Under $50', min: 0, max: 50 },
    { id: 'moderate', label: '$50 - $100', min: 50, max: 100 },
    { id: 'premium', label: '$100 - $200', min: 100, max: 200 },
    { id: 'luxury', label: 'Above $200', min: 200, max: Infinity },
  ];

  // Rating filters
  const ratingFilters = [
    { id: 'all', label: 'All Ratings', value: 0 },
    { id: '4plus', label: '4+ Stars', value: 4 },
    { id: '4.5plus', label: '4.5+ Stars', value: 4.5 },
  ];

  // Fetch doctors
  useEffect(() => {
    fetchDoctors();
  }, []);

  // Apply filters whenever any filter changes
  useEffect(() => {
    applyFilters();
  }, [doctors, searchQuery, selectedSpecialization, selectedRating, selectedFeeRange]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/doctors');
      
      // Filter only approved and active doctors
      const activeDoctors = response.data.doctors?.filter(
        doc => doc.isApproved && doc.isActive
      ) || [];
      
      setDoctors(activeDoctors);
      setFilteredDoctors(activeDoctors);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...doctors];

    // Search filter (name or specialization)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (doc) =>
          doc.name.toLowerCase().includes(query) ||
          doc.specialization?.toLowerCase().includes(query)
      );
    }

    // Specialization filter
    if (selectedSpecialization && selectedSpecialization !== 'all') {
      filtered = filtered.filter(
        (doc) => doc.specialization === selectedSpecialization
      );
    }

    // Rating filter
    if (selectedRating) {
      const ratingFilter = ratingFilters.find(r => r.id === selectedRating);
      if (ratingFilter && ratingFilter.value > 0) {
        filtered = filtered.filter((doc) => (doc.rating || 0) >= ratingFilter.value);
      }
    }

    // Fee range filter
    if (selectedFeeRange) {
      const feeFilter = feeRanges.find(f => f.id === selectedFeeRange);
      if (feeFilter) {
        filtered = filtered.filter(
          (doc) => 
            (doc.fees || 0) >= feeFilter.min && 
            (doc.fees || 0) <= feeFilter.max
        );
      }
    }

    setFilteredDoctors(filtered);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSpecialization('');
    setSelectedRating('');
    setSelectedFeeRange('');
  };

  const handleBookAppointment = (doctorId) => {
    navigate(`/patient/doctor-profile/${doctorId}`);
  };

  // Get specialization icon and color
  const getSpecializationInfo = (specialization) => {
    const spec = specializations.find(
      s => s.id === specialization || s.name === specialization
    );
    return spec || specializations[0];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Find Your Doctor
            </h1>
            <p className="text-slate-600 mt-1">
              Search from {doctors.length} verified healthcare professionals
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden"
          >
            <Filter size={18} />
            Filters
          </Button>
        </div>

        {/* Search Bar */}
        <Card className="p-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search by doctor name or specialization..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search size={18} />}
                className="w-full"
              />
            </div>
            {(searchQuery || selectedSpecialization || selectedRating || selectedFeeRange) && (
              <Button
                variant="outline"
                onClick={clearFilters}
              >
                <X size={18} />
                Clear
              </Button>
            )}
          </div>
        </Card>

        {/* Specialization Quick Filters */}
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">
            Popular Specializations
          </h3>
          <div className="flex flex-wrap gap-2">
            {specializations.map((spec) => {
              const Icon = spec.icon;
              const isSelected = selectedSpecialization === spec.id;
              
              return (
                <button
                  key={spec.id}
                  onClick={() => setSelectedSpecialization(
                    isSelected ? '' : spec.id
                  )}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all ${
                    isSelected
                      ? `border-${spec.color}-600 bg-${spec.color}-50 text-${spec.color}-700`
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <Icon size={16} />
                  <span className="text-sm font-medium">{spec.name}</span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Main Content */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className={`lg:block ${showFilters ? 'block' : 'hidden'} space-y-4`}>
            {/* Rating Filter */}
            <Card className="p-4">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Star size={18} className="text-yellow-500" />
                Rating
              </h3>
              <div className="space-y-2">
                {ratingFilters.map((rating) => (
                  <label
                    key={rating.id}
                    className="flex items-center gap-3 cursor-pointer p-2 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    <input
                      type="radio"
                      name="rating"
                      value={rating.id}
                      checked={selectedRating === rating.id}
                      onChange={(e) => setSelectedRating(e.target.value)}
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-slate-700">
                      {rating.label}
                    </span>
                  </label>
                ))}
              </div>
            </Card>

            {/* Fee Range Filter */}
            <Card className="p-4">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <DollarSign size={18} className="text-green-600" />
                Consultation Fee
              </h3>
              <div className="space-y-2">
                {feeRanges.map((fee) => (
                  <label
                    key={fee.id}
                    className="flex items-center gap-3 cursor-pointer p-2 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    <input
                      type="radio"
                      name="fee"
                      value={fee.id}
                      checked={selectedFeeRange === fee.id}
                      onChange={(e) => setSelectedFeeRange(e.target.value)}
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-slate-700">
                      {fee.label}
                    </span>
                  </label>
                ))}
              </div>
            </Card>

            {/* Availability Filter (Future Enhancement) */}
            <Card className="p-4">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Clock size={18} className="text-blue-600" />
                Availability
              </h3>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-slate-50 rounded-lg transition-colors">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-slate-700">
                    Available Today
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-slate-50 rounded-lg transition-colors">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-slate-700">
                    Available This Week
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-slate-50 rounded-lg transition-colors">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-slate-700">
                    Video Consultation
                  </span>
                </label>
              </div>
            </Card>
          </div>

          {/* Doctors Grid */}
          <div className="lg:col-span-3">
            {/* Results Count */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-slate-600">
                Showing <span className="font-semibold">{filteredDoctors.length}</span> doctors
              </p>
              <select className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option>Sort by: Recommended</option>
                <option>Highest Rated</option>
                <option>Lowest Fee</option>
                <option>Most Experienced</option>
              </select>
            </div>

            {/* Doctors List */}
            {filteredDoctors.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <Search size={32} className="text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  No Doctors Found
                </h3>
                <p className="text-slate-600 mb-6">
                  Try adjusting your filters or search criteria
                </p>
                <Button onClick={clearFilters}>
                  Clear All Filters
                </Button>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredDoctors.map((doctor) => {
                  const specInfo = getSpecializationInfo(doctor.specialization);
                  const SpecIcon = specInfo.icon;
                  
                  return (
                    <Card
                      key={doctor._id}
                      className="p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group"
                      onClick={() => handleBookAppointment(doctor._id)}
                    >
                      {/* Doctor Header */}
                      <div className="flex items-start gap-4 mb-4">
                        {/* Avatar */}
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center text-white font-bold text-xl shrink-0">
                          {doctor.name.charAt(0)}
                        </div>

                        {/* Doctor Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
                            Dr. {doctor.name}
                          </h3>
                          
                          {/* Specialization Badge */}
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-${specInfo.color}-100 text-${specInfo.color}-700 text-xs font-medium`}>
                              <SpecIcon size={14} />
                              {doctor.specialization}
                            </div>
                          </div>

                          {/* Rating */}
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={14}
                                  className={
                                    i < Math.floor(doctor.rating || 0)
                                      ? 'text-yellow-500 fill-yellow-500'
                                      : 'text-slate-300'
                                  }
                                />
                              ))}
                            </div>
                            <span className="text-sm font-medium text-slate-700">
                              {(doctor.rating || 0).toFixed(1)}
                            </span>
                            <span className="text-sm text-slate-500">
                              ({Math.floor(Math.random() * 200) + 50} reviews)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Doctor Details */}
                      <div className="space-y-3 mb-4">
                        {/* Experience */}
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Award size={16} className="text-indigo-600" />
                          <span>
                            {doctor.experience || 'N/A'} years experience
                          </span>
                        </div>

                        {/* Consultation Fee */}
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <DollarSign size={16} className="text-green-600" />
                          <span className="font-semibold text-slate-900">
                            ${doctor.fees || 0}
                          </span>
                          <span>per consultation</span>
                        </div>

                        {/* Patients Treated */}
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Users size={16} className="text-blue-600" />
                          <span>
                            {Math.floor(Math.random() * 500) + 100}+ patients treated
                          </span>
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge color="green" className="text-xs">
                          <Video size={12} />
                          Video Consultation
                        </Badge>
                        <Badge color="blue" className="text-xs">
                          Available Today
                        </Badge>
                        {doctor.rating >= 4.5 && (
                          <Badge color="yellow" className="text-xs">
                            <Star size={12} />
                            Top Rated
                          </Badge>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBookAppointment(doctor._id);
                          }}
                          className="flex-1"
                          size="sm"
                        >
                          <Calendar size={16} />
                          Book Appointment
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/patient/doctor-profile/${doctor._id}`);
                          }}
                        >
                          <ChevronRight size={16} />
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindDoctors;
