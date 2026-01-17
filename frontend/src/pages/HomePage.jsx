import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Video,
  FileText,
  Shield,
  Clock,
  Users,
  Heart,
  Stethoscope,
  Activity,
  Award,
  CheckCircle,
  ArrowRight,
  Star,
  MapPin,
  Phone,
  Mail,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import bannerImage from '../assets/banner.jpg';

/**
 * HomePage Component
 * 
 * Landing page for CareSync Healthcare Platform
 * Features hero section, feature showcase, how it works, testimonials, and CTA
 * 
 * @component
 */
const HomePage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Calendar,
      title: 'Easy Appointment Booking',
      description: 'Book appointments with top doctors in just a few clicks. Choose your preferred time slot and get instant confirmation.',
      color: 'indigo',
    },
    {
      icon: Video,
      title: 'Video Consultations',
      description: 'Connect with healthcare professionals from the comfort of your home through secure HD video calls.',
      color: 'green',
    },
    {
      icon: FileText,
      title: 'Digital Health Records',
      description: 'Access your complete medical history, prescriptions, and lab results anytime, anywhere.',
      color: 'blue',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your health data is encrypted and protected with enterprise-grade security measures.',
      color: 'purple',
    },
    {
      icon: Clock,
      title: '24/7 Availability',
      description: 'Get medical assistance round the clock with our always-available healthcare professionals.',
      color: 'orange',
    },
    {
      icon: Activity,
      title: 'Real-time Updates',
      description: 'Receive instant notifications about appointments, prescriptions, and test results.',
      color: 'pink',
    },
  ];

  const howItWorks = [
    {
      step: '01',
      title: 'Create Your Account',
      description: 'Sign up in less than 2 minutes with your basic information. Choose between patient, doctor, or admin roles.',
      icon: Users,
    },
    {
      step: '02',
      title: 'Find Your Doctor',
      description: 'Browse through our network of verified healthcare professionals. Filter by specialization, location, and availability.',
      icon: Stethoscope,
    },
    {
      step: '03',
      title: 'Book Appointment',
      description: 'Select your preferred date and time slot. Choose between in-person or online video consultations.',
      icon: Calendar,
    },
    {
      step: '04',
      title: 'Get Treatment',
      description: 'Attend your consultation, receive prescriptions, and access your medical records digitally.',
      icon: Heart,
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Patient',
      image: null,
      rating: 5,
      text: 'CareSync has completely transformed how I manage my healthcare. The video consultation feature saved me hours of commute time!',
      location: 'San Francisco, CA',
    },
    {
      name: 'Dr. Michael Chen',
      role: 'Cardiologist',
      image: null,
      rating: 5,
      text: 'As a healthcare provider, this platform makes it so easy to manage my patients and appointments. The interface is intuitive and efficient.',
      location: 'New York, NY',
    },
    {
      name: 'Emily Rodriguez',
      role: 'Patient',
      image: null,
      rating: 5,
      text: 'Being able to access my medical records and prescriptions anytime is incredibly convenient. Highly recommend CareSync!',
      location: 'Austin, TX',
    },
  ];

  const stats = [
    { value: '50K+', label: 'Active Patients' },
    { value: '1,000+', label: 'Verified Doctors' },
    { value: '100K+', label: 'Consultations' },
    { value: '98%', label: 'Satisfaction Rate' },
  ];

  const specializations = [
    'Cardiology',
    'Dermatology',
    'Pediatrics',
    'Orthopedics',
    'Neurology',
    'Dentistry',
    'Psychology',
    'General Practice',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white overflow-hidden">
      {/* Hero Section with Modern Design */}
      <section className="relative pt-24 pb-32 px-4 sm:px-6 lg:px-8">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Hero Content - Enhanced */}
            <div className="space-y-8 animate-fade-in-up">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group">
                <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                <span>Welcome to the Future of Healthcare</span>
                <TrendingUp className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
              
              {/* Main Headline - Gradient Text */}
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-black leading-tight">
                <span className="block text-slate-900">Your Health,</span>
                <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
                  Our Priority
                </span>
              </h1>
              
              {/* Description - Enhanced */}
              <p className="text-xl md:text-2xl text-slate-600 leading-relaxed max-w-xl">
                Connect with <span className="font-semibold text-indigo-600">1,000+ verified doctors</span>, 
                book appointments instantly, and manage your health records all in one 
                <span className="font-semibold text-purple-600"> secure platform</span>.
              </p>

              {/* CTA Buttons - Modern Design */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate('/register')}
                  className="group relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Book Appointment
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
                
                <button
                  onClick={() => navigate('/register?role=doctor')}
                  className="group px-8 py-4 bg-white text-slate-900 rounded-2xl font-semibold text-lg border-2 border-slate-200 hover:border-indigo-600 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                >
                  <span className="flex items-center justify-center gap-2">
                    Join as Doctor
                    <Stethoscope className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform" />
                  </span>
                </button>
              </div>

              {/* Quick Stats - Redesigned */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8">
                {stats.map((stat, index) => (
                  <div 
                    key={index} 
                    className="group relative bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-slate-200/50 hover:border-indigo-300 transition-all duration-300 hover:shadow-lg cursor-pointer"
                  >
                    <div className="text-4xl font-black bg-gradient-to-br from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                    <div className="text-sm font-medium text-slate-600 mt-1">{stat.label}</div>
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Image - Premium Design */}
            <div className="relative animate-fade-in-right">
              {/* Floating Elements */}
              <div className="absolute -top-10 -left-10 w-32 h-32 bg-indigo-500 rounded-3xl opacity-20 animate-float"></div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-500 rounded-full opacity-20 animate-float animation-delay-2000"></div>
              
              {/* Main Card */}
              <div className="relative bg-gradient-to-br from-white to-slate-50 rounded-[3rem] p-8 shadow-2xl border border-slate-200/50 backdrop-blur-xl overflow-hidden group hover:shadow-indigo-200/50 transition-all duration-500">
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Banner Image */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl mb-6">
                  <img 
                    src={bannerImage} 
                    alt="Healthcare Banner" 
                    className="w-full h-64 object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent"></div>
                  
                  {/* Verified Badge Overlay */}
                  <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <CheckCircle className="w-7 h-7 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">Verified Doctors</div>
                      <div className="text-xs text-slate-600">100% Certified</div>
                    </div>
                  </div>
                </div>

                {/* Feature Card */}
                <div className="relative bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-xl">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                      <Heart className="w-9 h-9" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">Healthcare Made Simple</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <span className="text-sm text-white/90">4.9/5.0 Rating</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-white/90 text-base leading-relaxed">
                    Experience seamless healthcare management with our cutting-edge platform
                  </p>
                  
                  {/* Video Call Badge */}
                  <div className="absolute bottom-6 right-6 bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-3 flex items-center gap-2">
                    <Video className="w-5 h-5 text-blue-300" />
                    <div className="text-sm">
                      <div className="font-semibold">Video Calls</div>
                      <div className="text-xs text-white/80">HD Quality</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Action Buttons */}
              <div className="absolute -right-4 top-1/4 space-y-4">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
                  <Zap className="w-8 h-8 text-indigo-600" />
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
                  <Activity className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Why Choose CareSync?
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              We provide comprehensive healthcare solutions designed to make your medical journey smooth and hassle-free.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const colorClasses = {
                indigo: 'bg-indigo-100 text-indigo-600',
                green: 'bg-green-100 text-green-600',
                blue: 'bg-blue-100 text-blue-600',
                purple: 'bg-purple-100 text-purple-600',
                orange: 'bg-orange-100 text-orange-600',
                pink: 'bg-pink-100 text-pink-600',
              };

              return (
                <Card key={index} className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${colorClasses[feature.color]} mb-4`}>
                    <Icon size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Getting started with CareSync is simple and straightforward. Follow these easy steps.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="relative">
                  <Card className="p-6 h-full hover:shadow-lg transition-shadow">
                    <div className="text-6xl font-bold text-indigo-100 mb-4">
                      {step.step}
                    </div>
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-indigo-600 text-white mb-4">
                      <Icon size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-slate-600">
                      {step.description}
                    </p>
                  </Card>
                  
                  {/* Arrow connector (hidden on last item) */}
                  {index < howItWorks.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                      <ArrowRight className="text-indigo-300" size={24} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Specializations Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Find Specialists
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Connect with expert doctors across various medical specializations
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {specializations.map((spec, index) => (
              <button
                key={index}
                onClick={() => navigate('/register')}
                className="px-6 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-700 font-medium hover:border-indigo-600 hover:text-indigo-600 hover:shadow-lg transition-all duration-300"
              >
                {spec}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Join thousands of satisfied patients and healthcare professionals
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 hover:shadow-xl transition-shadow">
                {/* Rating Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={18} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-slate-700 mb-6 leading-relaxed">
                  "{testimonial.text}"
                </p>

                {/* User Info */}
                <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white font-bold text-lg">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{testimonial.name}</div>
                    <div className="text-sm text-slate-600">{testimonial.role}</div>
                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                      <MapPin size={12} />
                      {testimonial.location}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Healthcare Experience?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join CareSync today and experience healthcare like never before
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/register')}
              className="bg-white text-indigo-600 hover:bg-slate-50"
            >
              Get Started for Free
              <ArrowRight size={20} />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/register?role=doctor')}
              className="border-white text-white hover:bg-white/10"
            >
              Join as Healthcare Provider
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h3 className="text-3xl font-bold text-white mb-6">Get In Touch</h3>
              <p className="text-slate-400 mb-8">
                Have questions? We're here to help. Contact our support team or visit our office.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
                    <MapPin className="text-white" size={24} />
                  </div>
                  <div>
                    <div className="font-semibold text-white mb-1">Address</div>
                    <div className="text-slate-400">
                      123 Medical Center Drive<br />
                      San Francisco, CA 94102
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
                    <Phone className="text-white" size={24} />
                  </div>
                  <div>
                    <div className="font-semibold text-white mb-1">Phone</div>
                    <div className="text-slate-400">(555) 123-4567</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
                    <Mail className="text-white" size={24} />
                  </div>
                  <div>
                    <div className="font-semibold text-white mb-1">Email</div>
                    <div className="text-slate-400">support@caresync.com</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-3xl font-bold text-white mb-6">Quick Links</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-white mb-4">For Patients</h4>
                  <ul className="space-y-3">
                    <li>
                      <a href="#" className="text-slate-400 hover:text-white transition-colors">
                        Find Doctors
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-slate-400 hover:text-white transition-colors">
                        Book Appointment
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-slate-400 hover:text-white transition-colors">
                        Video Consultation
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-slate-400 hover:text-white transition-colors">
                        Health Records
                      </a>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-4">For Doctors</h4>
                  <ul className="space-y-3">
                    <li>
                      <a href="#" className="text-slate-400 hover:text-white transition-colors">
                        Join CareSync
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-slate-400 hover:text-white transition-colors">
                        Manage Appointments
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-slate-400 hover:text-white transition-colors">
                        Patient Records
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-slate-400 hover:text-white transition-colors">
                        Earnings
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="mt-12 pt-8 border-t border-slate-800">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center text-white font-bold text-xl">
                  C
                </div>
                <span className="text-lg font-bold text-white">CareSync</span>
              </div>
              
              <div className="text-slate-400 text-sm">
                © 2026 CareSync Healthcare. All rights reserved.
              </div>

              <div className="flex items-center gap-6">
                <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Privacy Policy
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Terms of Service
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating styles for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 3s ease-in-out infinite 1s;
        }
      `}</style>
    </div>
  );
};

export default HomePage;
