import React, { useState } from 'react';
import { ShieldCheck, CreditCard, Lock, ArrowLeft, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Logic & Tools
import { useAuth } from '../../hooks/useAuth'; //
import { formatCurrency } from '../../utils/formatters'; //
import { ROLES } from '../../utils/constants'; //

// Stripe Elements (Mocked here - usually children of StripeElementsWrapper)
const CheckoutPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock data for the current transaction
  const transaction = {
    item: "Telehealth Consultation",
    provider: "Dr. Sarah Mitchell",
    fee: 120.00,
    tax: 5.50,
  };

  const total = transaction.fee + transaction.tax;

  const handlePayment = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    // Here logic would interact with Stripe's confirmPayment
    setTimeout(() => {
      setIsProcessing(false);
      navigate('/billing/success'); // Redirect to success page
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Navigation */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold mb-8 transition-colors"
        >
          <ArrowLeft size={18} /> Back to Dashboard
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 1. Payment Form Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-indigo-600 p-2 rounded-xl text-white">
                  <CreditCard size={24} />
                </div>
                <h2 className="text-2xl font-black text-slate-900">Secure Payment</h2>
              </div>

              <form onSubmit={handlePayment} className="space-y-6">
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-2">Cardholder Name</label>
                  <input 
                    type="text" 
                    placeholder={user?.name || "Full Name"}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                {/* Stripe CardElement would be injected here */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 block">Card Details</label>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-sm">Card Number: **** **** **** ****</span>
                      <CreditCard size={18} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-bold text-slate-700 block mb-2">Expiry Date</label>
                    <input type="text" placeholder="MM / YY" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700 block mb-2">CVC</label>
                    <input type="text" placeholder="***" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                  </div>
                </div>

                <button 
                  disabled={isProcessing}
                  className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-3"
                >
                  {isProcessing ? "Processing..." : `Pay ${formatCurrency(total)}`}
                </button>
              </form>

              <div className="mt-8 flex items-center justify-center gap-6 border-t border-slate-50 pt-8">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                  <ShieldCheck size={16} /> Secure Checkout
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                  <Lock size={16} /> Encrypted
                </div>
              </div>
            </div>
          </div>

          {/* 2. Order Summary Sidebar */}
          <aside className="space-y-6">
            <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl">
              <h3 className="text-xl font-bold mb-6">Order Summary</h3>
              
              <div className="space-y-4 border-b border-slate-800 pb-6 mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-indigo-400 text-sm">Consultation</p>
                    <p className="text-slate-300 text-sm mt-1">{transaction.provider}</p>
                  </div>
                  <span className="font-bold">{formatCurrency(transaction.fee)}</span>
                </div>
                
                <div className="flex justify-between text-sm text-slate-400">
                  <span>Service Tax (VAT)</span>
                  <span>{formatCurrency(transaction.tax)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-xs">Total Amount</span>
                <span className="text-2xl font-black text-white">{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 flex items-start gap-4">
              <div className="bg-amber-50 p-2 rounded-lg text-amber-600">
                <Info size={20} />
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Payments are processed via **Stripe**. Your healthcare provider will receive confirmation immediately upon successful transaction.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;