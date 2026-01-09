import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Calendar, Download, ArrowRight, Printer } from 'lucide-react';

// Logic & Tools
import { formatCurrency, formatDate } from '../../utils/formatters'; //

const SuccessPage = () => {
  // In a real app, these would come from the router state or an API call after payment
  const receipt = {
    transactionId: 'CS-882910',
    amount: 125.50,
    date: new Date().toISOString(),
    appointment: {
      doctor: 'Dr. Sarah Mitchell',
      time: '2026-01-15T10:30:00Z',
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-xl w-full">
        {/* 1. Success Animation & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full mb-4 animate-bounce">
            <CheckCircle size={40} />
          </div>
          <h1 className="text-3xl font-black text-slate-900">Payment Successful!</h1>
          <p className="text-slate-500 mt-2">
            Your appointment with **{receipt.appointment.doctor}** is now confirmed.
          </p>
        </div>

        {/* 2. Digital Receipt Card */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden mb-8">
          <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Transaction ID</p>
              <p className="font-mono text-sm">{receipt.transactionId}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Amount Paid</p>
              <p className="text-xl font-black">{formatCurrency(receipt.amount)}</p>
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div className="flex items-start gap-4 p-4 bg-indigo-50 rounded-2xl">
              <Calendar className="text-indigo-600 shrink-0" size={24} />
              <div>
                <p className="text-sm font-bold text-slate-900">Appointment Scheduled</p>
                <p className="text-sm text-indigo-600 font-medium">
                  {formatDate(receipt.appointment.time, 'full')} at {formatDate(receipt.appointment.time, 'time')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all">
                <Download size={18} /> Download PDF
              </button>
              <button className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all">
                <Printer size={18} /> Print Receipt
              </button>
            </div>
          </div>
        </div>

        {/* 3. Action Links */}
        <div className="space-y-4">
          <Link 
            to="/patient/dashboard" 
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-center flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            Go to Dashboard <ArrowRight size={20} />
          </Link>
          <p className="text-center text-xs text-slate-400">
            A confirmation email with instructions for your video consultation has been sent to your inbox.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;