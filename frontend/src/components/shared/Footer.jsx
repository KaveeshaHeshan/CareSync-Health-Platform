import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Mail, 
  Phone, 
  MapPin, 
  Heart 
} from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-100">
      {/* 1. Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Column 1: Brand & About */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                C
              </div>
              <span className="text-xl font-bold text-slate-800">CareSync</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">
              Revolutionizing healthcare through AI-driven triage, seamless 
              tele-consultations, and real-time medical record management. 
              Your health, synchronized.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                <Twitter size={18} />
              </a>
              <a href="#" className="p-2 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                <Linkedin size={18} />
              </a>
              <a href="#" className="p-2 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                <Facebook size={18} />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-bold text-slate-800 mb-6">Quick Links</h4>
            <ul className="space-y-4">
              {['Find a Doctor', 'AI Triage', 'Services', 'Pricing', 'Pharmacy'].map((item) => (
                <li key={item}>
                  <Link to="#" className="text-sm text-slate-500 hover:text-indigo-600 transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div>
            <h4 className="font-bold text-slate-800 mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-slate-500">
                <MapPin size={18} className="text-indigo-600 flex-shrink-0" />
                <span>123 Medical Plaza, Health City,<br />ST 12345</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-500">
                <Phone size={18} className="text-indigo-600 flex-shrink-0" />
                <span>+1 (555) 000-1234</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-500">
                <Mail size={18} className="text-indigo-600 flex-shrink-0" />
                <span>support@caresync.com</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h4 className="font-bold text-slate-800 mb-6">Stay Updated</h4>
            <p className="text-sm text-slate-500 mb-4">
              Subscribe to get health tips and platform updates.
            </p>
            <div className="space-y-3">
              <Input placeholder="Enter your email" className="bg-slate-50 border-none" />
              <Button className="w-full" variant="primary">Subscribe</Button>
            </div>
          </div>
        </div>

        {/* 2. Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-400 flex items-center gap-1">
            © {currentYear} CareSync. Made with <Heart size={14} className="text-red-400 fill-red-400" /> for better health.
          </p>
          <div className="flex gap-6">
            <Link to="#" className="text-xs text-slate-400 hover:text-slate-600">Privacy Policy</Link>
            <Link to="#" className="text-xs text-slate-400 hover:text-slate-600">Terms of Service</Link>
            <Link to="#" className="text-xs text-slate-400 hover:text-slate-600">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;