import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Calendar, 
  MapPin, 
  Clock,
  Heart,
  Shield,
  Users,
  CheckCircle,
  ChevronRight,
  Star,
  Stethoscope,
  Activity,
  Baby,
  Droplet,
  Eye,
  Brain,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Linkedin
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import logo from '../assets/logo1.png';
import banner from '../assets/banner.jpg';

const HomePage = () => {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    doctorName: '',
    specialization: '',
    location: '',
    date: '',
  });

  const handleSearch = (e) => {
    e.preventDefault();
    navigate('/register'); // Navigate to registration for now
  };

  // Specializations data
  const specializations = [
    { 
      name: 'General Physician', 
      icon: <Stethoscope className="w-8 h-8" />, 
      color: 'bg-blue-50 text-blue-600',
      count: '150+ Doctors'
    },
    { 
      name: 'Dentist', 
      icon: <Activity className="w-8 h-8" />, 
      color: 'bg-green-50 text-green-600',
      count: '80+ Doctors'
    },
    { 
      name: 'Cardiologist', 
      icon: <Heart className="w-8 h-8" />, 
      color: 'bg-red-50 text-red-600',
      count: '60+ Doctors'
    },
    { 
      name: 'Pediatrician', 
      icon: <Baby className="w-8 h-8" />, 
      color: 'bg-purple-50 text-purple-600',
      count: '90+ Doctors'
    },
    { 
      name: 'Dermatologist', 
      icon: <Droplet className="w-8 h-8" />, 
      color: 'bg-pink-50 text-pink-600',
      count: '70+ Doctors'
    },
    { 
      name: 'Ophthalmologist', 
      icon: <Eye className="w-8 h-8" />, 
      color: 'bg-indigo-50 text-indigo-600',
      count: '45+ Doctors'
    },
  ];

  // Featured doctors data
  const featuredDoctors = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      specialization: 'Cardiologist',
      hospital: 'City General Hospital',
      rating: 4.9,
      experience: '15 years',
      image: 'https://i.pravatar.cc/300?img=1',
    },
    {
      id: 2,
      name: 'Dr. Michael Chen',
      specialization: 'Pediatrician',
      hospital: 'Children\'s Care Center',
      rating: 4.8,
      experience: '12 years',
      image: 'https://i.pravatar.cc/300?img=12',
    },
    {
      id: 3,
      name: 'Dr. Emily Williams',
      specialization: 'Dermatologist',
      hospital: 'Skin & Beauty Clinic',
      rating: 4.9,
      experience: '10 years',
      image: 'https://i.pravatar.cc/300?img=5',
    },
  ];

  // Platform benefits
  const benefits = [
    {
      icon: <Clock className="w-8 h-8" />,
      title: '24/7 Appointment Booking',
      description: 'Book appointments anytime, anywhere at your convenience',
      color: 'bg-blue-50 text-blue-600'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Verified Doctors',
      description: 'All doctors are verified and certified professionals',
      color: 'bg-green-50 text-green-600'
    },
    {
      icon: <CheckCircle className="w-8 h-8" />,
      title: 'Easy Cancellation',
      description: 'Cancel or reschedule appointments hassle-free',
      color: 'bg-orange-50 text-orange-600'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Online & Physical Consultations',
      description: 'Choose between video calls or in-person visits',
      color: 'bg-purple-50 text-purple-600'
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: 'Secure Patient Data',
      description: 'Your medical records are encrypted and protected',
      color: 'bg-red-50 text-red-600'
    },
    {
      icon: <Activity className="w-8 h-8" />,
      title: 'Health Records Management',
      description: 'Access your complete health history in one place',
      color: 'bg-indigo-50 text-indigo-600'
    },
  ];

  // How it works steps
  const steps = [
    {
      step: '1',
      title: 'Search for a Doctor',
      description: 'Find the right doctor by name, specialization, or location',
      icon: <Search className="w-6 h-6" />
    },
    {
      step: '2',
      title: 'Choose Date & Time',
      description: 'Select an available slot that fits your schedule',
      icon: <Calendar className="w-6 h-6" />
    },
    {
      step: '3',
      title: 'Confirm Appointment',
      description: 'Complete booking with instant confirmation',
      icon: <CheckCircle className="w-6 h-6" />
    },
    {
      step: '4',
      title: 'Visit or Consult Online',
      description: 'Meet your doctor in-person or via video call',
      icon: <Activity className="w-6 h-6" />
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* 🔹 1. HEADER/NAVBAR */}
      <header className="bg-white/95 backdrop-blur-md shadow-md sticky top-0 z-50 border-b border-gray-100">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="relative">
                <img 
                  src={logo} 
                  alt="CareSync Logo" 
                  className="h-14 w-auto transition-transform group-hover:scale-105" 
                />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                CareSync
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-1">
              <a 
                href="#home" 
                className="px-4 py-2 text-gray-700 hover:text-indigo-600 font-medium transition-all rounded-lg hover:bg-indigo-50"
              >
                Home
              </a>
              <a 
                href="#doctors" 
                className="px-4 py-2 text-gray-700 hover:text-indigo-600 font-medium transition-all rounded-lg hover:bg-indigo-50"
              >
                Find Doctors
              </a>
              <a 
                href="#booking" 
                className="px-4 py-2 text-gray-700 hover:text-indigo-600 font-medium transition-all rounded-lg hover:bg-indigo-50"
              >
                Book Appointment
              </a>
              <a 
                href="#services" 
                className="px-4 py-2 text-gray-700 hover:text-indigo-600 font-medium transition-all rounded-lg hover:bg-indigo-50"
              >
                Services
              </a>
              <a 
                href="#contact" 
                className="px-4 py-2 text-gray-700 hover:text-indigo-600 font-medium transition-all rounded-lg hover:bg-indigo-50"
              >
                Contact
              </a>
            </div>

            {/* Login/Signup Buttons */}
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="hidden sm:inline-flex border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300"
                >
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button 
                  size="sm"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30"
                >
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* 🔹 2. HERO SECTION */}
      <section 
        id="home" 
        className="relative text-white overflow-hidden min-h-[600px] md:min-h-[700px] flex items-center"
      >
        {/* Banner Background with Overlay */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${banner})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        
        {/* Gradient Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 w-full">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm mb-8">
              <Heart className="w-4 h-4" />
              <span>Trusted by 50,000+ Patients</span>
            </div>
            
            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              Book Doctor <br />
              Appointments <br />
              <span className="text-indigo-200">Anytime, Anywhere</span>
            </h1>
            
            {/* Description */}
            <p className="text-xl md:text-2xl text-indigo-100 leading-relaxed mb-8 max-w-2xl">
              Find trusted doctors and book appointments in minutes. 
              Your health is our priority.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 mb-12">
              <Button 
                size="lg" 
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/20 backdrop-blur-sm"
                onClick={() => navigate('/register')}
              >
                Find a Doctor
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/20 backdrop-blur-sm"
                onClick={() => document.getElementById('search').scrollIntoView({ behavior: 'smooth' })}
              >
                Book Appointment
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 pt-8 border-t border-white/30">
              <div>
                <div className="text-3xl md:text-4xl font-bold">500+</div>
                <div className="text-indigo-200 text-sm">Verified Doctors</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold">50K+</div>
                <div className="text-indigo-200 text-sm">Happy Patients</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold">100K+</div>
                <div className="text-indigo-200 text-sm">Appointments</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🔹 3. SEARCH SECTION */}
      <section id="search" className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Find Your Perfect Doctor
            </h2>
            <p className="text-gray-600 text-lg">
              Search by name, specialization, location, or availability
            </p>
          </div>

          <Card className="p-8 shadow-lg">
            <form onSubmit={handleSearch} className="space-y-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Doctor Name */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Doctor Name
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Enter doctor name"
                      value={searchData.doctorName}
                      onChange={(e) => setSearchData({...searchData, doctorName: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Specialization */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specialization
                  </label>
                  <div className="relative">
                    <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      value={searchData.specialization}
                      onChange={(e) => setSearchData({...searchData, specialization: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none"
                    >
                      <option value="">All Specializations</option>
                      <option value="general">General Physician</option>
                      <option value="cardiologist">Cardiologist</option>
                      <option value="dentist">Dentist</option>
                      <option value="pediatrician">Pediatrician</option>
                      <option value="dermatologist">Dermatologist</option>
                      <option value="ophthalmologist">Ophthalmologist</option>
                    </select>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location / Hospital
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Enter location"
                      value={searchData.location}
                      onChange={(e) => setSearchData({...searchData, location: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      value={searchData.date}
                      onChange={(e) => setSearchData({...searchData, date: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <Button type="submit" size="lg" className="px-12">
                  <Search className="w-5 h-5 mr-2" />
                  Search Doctors
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </section>

      {/* 🔹 4. HOW IT WORKS */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Book your appointment in 4 simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <Card className="p-6 text-center hover:shadow-lg transition-shadow h-full">
                  {/* Step Number Badge */}
                  <div className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    {step.step}
                  </div>
                  
                  {/* Icon */}
                  <div className="flex justify-center mb-4 text-indigo-600">
                    {step.icon}
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">
                    {step.description}
                  </p>
                </Card>

                {/* Arrow between steps */}
                {index < steps.length - 1 && (
                  <ChevronRight className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-indigo-300 w-8 h-8" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🔹 5. SPECIALIZATIONS */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Medical Specializations
            </h2>
            <p className="text-gray-600 text-lg">
              Find specialists across various medical fields
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {specializations.map((spec, index) => (
              <Card 
                key={index} 
                className="p-6 text-center hover:shadow-lg transition-all cursor-pointer hover:-translate-y-1"
              >
                <div className={`w-16 h-16 ${spec.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  {spec.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">
                  {spec.name}
                </h3>
                <p className="text-xs text-gray-500">
                  {spec.count}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 🔹 6. FEATURED DOCTORS */}
      <section id="doctors" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Doctors
            </h2>
            <p className="text-gray-600 text-lg">
              Meet our top-rated healthcare professionals
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredDoctors.map((doctor) => (
              <Card key={doctor.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                <img 
                  src={doctor.image} 
                  alt={doctor.name}
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-900">
                      {doctor.name}
                    </h3>
                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold text-yellow-700">
                        {doctor.rating}
                      </span>
                    </div>
                  </div>

                  <p className="text-indigo-600 font-medium mb-2">
                    {doctor.specialization}
                  </p>
                  <p className="text-gray-600 text-sm mb-4 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {doctor.hospital}
                  </p>
                  <p className="text-gray-500 text-sm mb-4">
                    Experience: {doctor.experience}
                  </p>

                  <Button className="w-full" onClick={() => navigate('/register')}>
                    Book Now
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="outline" size="lg" onClick={() => navigate('/register')}>
              View All Doctors
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* 🔹 7. PLATFORM BENEFITS */}
      <section className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose CareSync?
            </h2>
            <p className="text-gray-600 text-lg">
              Experience healthcare made simple, secure, and accessible
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="p-8 hover:shadow-lg transition-shadow">
                <div className={`w-16 h-16 ${benefit.color} rounded-xl flex items-center justify-center mb-6`}>
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 🔹 8. CALL TO ACTION */}
      <section id="booking" className="py-20 bg-indigo-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Need a Doctor Today?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 leading-relaxed">
            Book your appointment now and get instant confirmation. 
            Your health can't wait!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              size="lg" 
              className="bg-white text-indigo-600 hover:bg-indigo-50"
              onClick={() => navigate('/register')}
            >
              Get Started Now
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-white text-white hover:bg-white/10"
            >
              <Phone className="w-5 h-5 mr-2" />
              Call Us: 1-800-CARESYNC
            </Button>
          </div>
        </div>
      </section>

      {/* 🔹 9. FOOTER */}
      <footer id="contact" className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Company Info */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <img src={logo} alt="CareSync Logo" className="h-10 w-auto" />
                <span className="text-xl font-bold text-white">CareSync</span>
              </div>
              <p className="text-gray-400 mb-6">
                Revolutionizing healthcare through seamless doctor appointments 
                and patient care management.
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-indigo-600 rounded-lg flex items-center justify-center transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-indigo-600 rounded-lg flex items-center justify-center transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-indigo-600 rounded-lg flex items-center justify-center transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-indigo-600 rounded-lg flex items-center justify-center transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-semibold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-3">
                <li><a href="#home" className="hover:text-indigo-400 transition-colors">Home</a></li>
                <li><a href="#doctors" className="hover:text-indigo-400 transition-colors">Find Doctors</a></li>
                <li><a href="#services" className="hover:text-indigo-400 transition-colors">Services</a></li>
                <li><Link to="/register" className="hover:text-indigo-400 transition-colors">Book Appointment</Link></li>
                <li><a href="#contact" className="hover:text-indigo-400 transition-colors">Contact Us</a></li>
              </ul>
            </div>

            {/* About & Legal */}
            <div>
              <h3 className="text-white font-semibold text-lg mb-4">About & Legal</h3>
              <ul className="space-y-3">
                <li><a href="#" className="hover:text-indigo-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Our Team</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">FAQs</a></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-white font-semibold text-lg mb-4">Contact Information</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-indigo-400 mt-1 flex-shrink-0" />
                  <span>123 Healthcare Street, Medical District, NY 10001</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                  <span>1-800-CARESYNC</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                  <span>support@caresync.com</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-sm">
                © 2026 CareSync Health Platform. All rights reserved.
              </p>
              <div className="flex gap-6 text-sm">
                <a href="#" className="hover:text-indigo-400 transition-colors">Privacy</a>
                <a href="#" className="hover:text-indigo-400 transition-colors">Terms</a>
                <a href="#" className="hover:text-indigo-400 transition-colors">Cookies</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
