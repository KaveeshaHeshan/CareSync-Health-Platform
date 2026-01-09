import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, AlertCircle, RefreshCcw, Headset, ArrowLeft } from 'lucide-react';

// Logic & Tools
import { useAuth } from '../../hooks/useAuth'; //

const CancelPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-xl w-full">
        {/* 1. Status Icon & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-rose-100 text-rose-600 rounded-full mb-4">
            <XCircle size={40} />
          </div>
          <h1 className="text-3xl font-black text-slate-900">Payment Cancelled</h1>
          <p className="text-slate-500 mt-2">
            The transaction was not completed. No funds have been deducted from your account.
          </p>
        </div>

        {/* 2. Troubleshooting & Info Card */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden mb-8">
          <div className="p-8 space-y-6">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <AlertCircle size={18} className="text-amber-500" /> Common Reasons for Failure:
            </h3>
            
            <ul className="space-y-4">
              {[
                "Insufficient funds or card limit reached.",
                "Incorrect card details or expired security code.",
                "Transaction declined by your bank's security filter.",
                "Session timed out during the payment process."
              ].map((reason, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                  <div className="w-1.5 h-1.5 bg-slate-300 rounded-full mt-1.5 shrink-0" />
                  {reason}
                </li>
              ))}
            </ul>

            <div className="pt-4 border-t border-slate-50 flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => navigate('/patient/booking')}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
              >
                <RefreshCcw size={18} /> Retry Payment
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all">
                <Headset size={18} /> Contact Support
              </button>
            </div>
          </div>
        </div>

        {/* 3. Footer Link */}
        <button 
          onClick={() => navigate('/patient/dashboard')}
          className="w-full text-slate-500 hover:text-indigo-600 font-bold flex items-center justify-center gap-2 transition-colors"
        >
          <ArrowLeft size={18} /> Return to Dashboard
        </button>
      </div>
    </div>
  );
};

export default CancelPage;