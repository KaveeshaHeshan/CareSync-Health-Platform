import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Stethoscope, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  Heart
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Stethoscope className="h-8 w-8 text-indigo-500" />
              <span className="text-xl font-bold text-white">CareSync</span>
            </div>
            <p className="text-sm text-gray-400">
              Your trusted healthcare platform connecting patients with qualified doctors for seamless medical consultations and care.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-800 rounded-full hover:bg-indigo-600 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-800 rounded-full hover:bg-indigo-600 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-800 rounded-full hover:bg-indigo-600 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-800 rounded-full hover:bg-indigo-600 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-sm hover:text-indigo-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-sm hover:text-indigo-400 transition-colors">
                  Our Services
                </Link>
              </li>
              <li>
                <Link to="/doctors" className="text-sm hover:text-indigo-400 transition-colors">
                  Find Doctors
                </Link>
              </li>
              <li>
                <Link to="/specialties" className="text-sm hover:text-indigo-400 transition-colors">
                  Specialties
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-sm hover:text-indigo-400 transition-colors">
                  Health Blog
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-sm hover:text-indigo-400 transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* For Patients */}
          <div>
            <h3 className="text-white font-semibold mb-4">For Patients</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/patient/register" className="text-sm hover:text-indigo-400 transition-colors">
                  Register as Patient
                </Link>
              </li>
              <li>
                <Link to="/patient/dashboard" className="text-sm hover:text-indigo-400 transition-colors">
                  Patient Dashboard
                </Link>
              </li>
              <li>
                <Link to="/patient/appointments" className="text-sm hover:text-indigo-400 transition-colors">
                  Book Appointment
                </Link>
              </li>
              <li>
                <Link to="/patient/prescriptions" className="text-sm hover:text-indigo-400 transition-colors">
                  My Prescriptions
                </Link>
              </li>
              <li>
                <Link to="/patient/lab-results" className="text-sm hover:text-indigo-400 transition-colors">
                  Lab Results
                </Link>
              </li>
              <li>
                <Link to="/patient/billing" className="text-sm hover:text-indigo-400 transition-colors">
                  Billing & Payments
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm">
                  123 Medical Center Drive<br />
                  Healthcare City, HC 12345
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-indigo-500 flex-shrink-0" />
                <a href="tel:+1234567890" className="text-sm hover:text-indigo-400 transition-colors">
                  +1 (234) 567-890
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-indigo-500 flex-shrink-0" />
                <a href="mailto:support@caresync.com" className="text-sm hover:text-indigo-400 transition-colors">
                  support@caresync.com
                </a>
              </li>
            </ul>
            <div className="mt-4">
              <h4 className="text-white font-medium text-sm mb-2">Emergency Hotline</h4>
              <a 
                href="tel:911" 
                className="inline-flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                <Phone className="h-4 w-4" />
                <span>Call 911</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-400">
              © {currentYear} CareSync. All rights reserved.
            </div>
            <div className="flex items-center space-x-1 text-sm text-gray-400">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-500 fill-current" />
              <span>for better healthcare</span>
            </div>
            <div className="flex space-x-6">
              <Link to="/privacy" className="text-sm text-gray-400 hover:text-indigo-400 transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-sm text-gray-400 hover:text-indigo-400 transition-colors">
                Terms of Service
              </Link>
              <Link to="/cookies" className="text-sm text-gray-400 hover:text-indigo-400 transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
