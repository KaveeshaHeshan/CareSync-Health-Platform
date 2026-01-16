import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  MapPin,
  Clock,
  DollarSign,
  Award,
  Users,
  Video,
  Calendar,
  Heart,
  BookOpen,
  CheckCircle,
  Shield,
  ThumbsUp,
  Stethoscope,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import axiosInstance from '../../api/axiosInstance';
import { formatDate } from '../../utils/formatters';

/**
 * DoctorProfile Component
 * 
 * Detailed doctor profile page with qualifications, reviews,
 * available time slots, and booking functionality
 * 
 * @component
 */
const DoctorProfile = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [consultationType, setConsultationType] = useState('online');

  // Mock available slots (in real app, fetch from API)
  const availableSlots = {
    morning: ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'],
    afternoon: ['02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'],
    evening: ['06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM'],
  };

  // Mock reviews (in real app, fetch from API)
  const reviews = [
    {
      id: 1,
      patientName: 'Sarah Johnson',
      rating: 5,
      date: '2024-01-10',
      comment: 'Excellent doctor! Very professional and caring. Took time to explain everything clearly.',
      helpful: 24,
    },
    {
      id: 2,
      patientName: 'Michael Chen',
      rating: 5,
      date: '2024-01-08',
      comment: 'Great experience with video consultation. Dr. was very attentive and gave practical advice.',
      helpful: 18,
    },
    {
      id: 3,
      patientName: 'Emily Davis',
      rating: 4,
      date: '2024-01-05',
      comment: 'Very knowledgeable and patient. Would definitely recommend!',
      helpful: 15,
    },
  ];

  // Fetch doctor details
  useEffect(() => {
    fetchDoctorDetails();
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
  }, [doctorId]);

  const fetchDoctorDetails = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/doctors/${doctorId}`);
      setDoctor(response.data.doctor);
    } catch (error) {
      console.error('Error fetching doctor details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = () => {
    if (!selectedDate || !selectedTime) {
      alert('Please select date and time');
      return;
    }

    // Navigate to booking details page with selected info
    navigate('/patient/booking-details', {
      state: {
        doctor,
        date: selectedDate,
        time: selectedTime,
        type: consultationType,
      },
    });
  };

  // Generate next 7 days for date selection
  const getNext7Days = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      days.push({
        date: date.toISOString().split('T')[0],
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: date.getDate(),
        month: date.toLocaleDateString('en-US', { month: 'short' }),
      });
    }
    
    return days;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Doctor Not Found
          </h2>
          <Button onClick={() => navigate('/patient/find-doctors')}>
            Back to Search
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="gap-2"
        >
          <ArrowLeft size={18} />
          Back
        </Button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Doctor Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Doctor Header Card */}
            <Card className="p-6">
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Avatar */}
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center text-white font-bold text-5xl shrink-0">
                  {doctor.name.charAt(0)}
                </div>

                {/* Doctor Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h1 className="text-3xl font-bold text-slate-900 mb-2">
                        Dr. {doctor.name}
                      </h1>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge color="indigo" className="text-sm">
                          <Stethoscope size={14} />
                          {doctor.specialization}
                        </Badge>
                        {doctor.isApproved && (
                          <Badge color="green" className="text-sm">
                            <CheckCircle size={14} />
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={20}
                          className={
                            i < Math.floor(doctor.rating || 0)
                              ? 'text-yellow-500 fill-yellow-500'
                              : 'text-slate-300'
                          }
                        />
                      ))}
                    </div>
                    <span className="text-lg font-semibold text-slate-700">
                      {(doctor.rating || 0).toFixed(1)}
                    </span>
                    <span className="text-slate-500">
                      ({reviews.length} reviews)
                    </span>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                        <Award size={20} className="text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">Experience</p>
                        <p className="text-sm font-semibold text-slate-900">
                          {doctor.experience || 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <Users size={20} className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">Patients</p>
                        <p className="text-sm font-semibold text-slate-900">
                          {Math.floor(Math.random() * 500) + 100}+
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <DollarSign size={20} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">Consultation</p>
                        <p className="text-sm font-semibold text-slate-900">
                          ${doctor.fees || 0}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                        <Video size={20} className="text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">Video Call</p>
                        <p className="text-sm font-semibold text-slate-900">
                          Available
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* About Section */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <BookOpen size={20} />
                About
              </h2>
              <p className="text-slate-700 leading-relaxed">
                Dr. {doctor.name} is a highly experienced {doctor.specialization} specialist 
                with {doctor.experience || 'several years'} of experience in treating patients. 
                Known for providing compassionate care and evidence-based treatment approaches, 
                Dr. {doctor.name} has helped hundreds of patients achieve better health outcomes.
              </p>
              
              <div className="mt-6 grid sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                  <Shield size={20} className="text-indigo-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">
                      Education
                    </h3>
                    <p className="text-sm text-slate-600">
                      MD - {doctor.specialization}<br />
                      Board Certified
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                  <MapPin size={20} className="text-indigo-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">
                      Location
                    </h3>
                    <p className="text-sm text-slate-600">
                      CareSync Medical Center<br />
                      New York, NY
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Reviews Section */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <Star size={20} />
                Patient Reviews
              </h2>
              
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="p-4 bg-slate-50 rounded-xl"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {review.patientName}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                className={
                                  i < review.rating
                                    ? 'text-yellow-500 fill-yellow-500'
                                    : 'text-slate-300'
                                }
                              />
                            ))}
                          </div>
                          <span className="text-sm text-slate-500">
                            {formatDate(review.date)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-slate-700 mb-3">
                      {review.comment}
                    </p>
                    
                    <button className="flex items-center gap-2 text-sm text-slate-600 hover:text-indigo-600">
                      <ThumbsUp size={14} />
                      <span>Helpful ({review.helpful})</span>
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column - Booking */}
          <div className="space-y-6">
            {/* Booking Card */}
            <Card className="p-6 sticky top-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">
                Book Appointment
              </h2>

              {/* Consultation Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Consultation Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setConsultationType('online')}
                    className={`p-4 border-2 rounded-xl transition-all ${
                      consultationType === 'online'
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Video
                      size={24}
                      className={`mx-auto mb-2 ${
                        consultationType === 'online'
                          ? 'text-indigo-600'
                          : 'text-slate-400'
                      }`}
                    />
                    <p className="text-sm font-medium text-slate-900">
                      Video Call
                    </p>
                  </button>
                  
                  <button
                    onClick={() => setConsultationType('in-person')}
                    className={`p-4 border-2 rounded-xl transition-all ${
                      consultationType === 'in-person'
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <MapPin
                      size={24}
                      className={`mx-auto mb-2 ${
                        consultationType === 'in-person'
                          ? 'text-indigo-600'
                          : 'text-slate-400'
                      }`}
                    />
                    <p className="text-sm font-medium text-slate-900">
                      In-Person
                    </p>
                  </button>
                </div>
              </div>

              {/* Date Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Select Date
                </label>
                <div className="grid grid-cols-7 gap-2">
                  {getNext7Days().map((day) => (
                    <button
                      key={day.date}
                      onClick={() => setSelectedDate(day.date)}
                      className={`p-2 rounded-xl border-2 transition-all ${
                        selectedDate === day.date
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <p className="text-xs text-slate-600">{day.day}</p>
                      <p className="text-lg font-bold text-slate-900">
                        {day.dayNum}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Slots */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Select Time Slot
                </label>
                
                {/* Morning */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-slate-600 mb-2">
                    Morning
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {availableSlots.morning.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`p-2 text-xs rounded-lg border transition-all ${
                          selectedTime === time
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-medium'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Afternoon */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-slate-600 mb-2">
                    Afternoon
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {availableSlots.afternoon.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`p-2 text-xs rounded-lg border transition-all ${
                          selectedTime === time
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-medium'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Evening */}
                <div>
                  <p className="text-xs font-medium text-slate-600 mb-2">
                    Evening
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {availableSlots.evening.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`p-2 text-xs rounded-lg border transition-all ${
                          selectedTime === time
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-medium'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Fee Summary */}
              <div className="mb-6 p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">
                    Consultation Fee
                  </span>
                  <span className="text-lg font-bold text-slate-900">
                    ${doctor.fees || 0}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Payment required before appointment
                </p>
              </div>

              {/* Book Button */}
              <Button
                onClick={handleBookAppointment}
                className="w-full"
                size="lg"
                disabled={!selectedDate || !selectedTime}
              >
                <Calendar size={18} />
                Continue to Book
              </Button>

              <p className="text-xs text-center text-slate-500 mt-4">
                By booking, you agree to our terms and conditions
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
