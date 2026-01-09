import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { ShieldCheck, Lock, CreditCard } from 'lucide-react';
import Card from '../../components/ui/Card';

// Initialize Stripe with your Public Key
// In a real app, this would come from an environment variable: 
// process.env.REACT_APP_STRIPE_PUBLIC_KEY
const stripePromise = loadStripe('pk_test_your_key_here');

const StripeElementsWrapper = ({ children, clientSecret, amount }) => {
  
  // Customizing the appearance of Stripe Elements to match CareSync's aesthetic
  const appearance = {
    theme: 'stripe',
    variables: {
      colorPrimary: '#4f46e5', // Indigo-600
      colorBackground: '#f8fafc', // Slate-50
      colorText: '#1e293b', // Slate-800
      colorDanger: '#ef4444', // Rose-500
      fontFamily: 'Inter, system-ui, sans-serif',
      borderRadius: '16px',
    },
    rules: {
      '.Input': {
        border: 'none',
        boxShadow: 'none',
      },
      '.Label': {
        fontWeight: '700',
        fontSize: '12px',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: '#94a3b8', // Slate-400
      },
    },
  };

  const options = {
    clientSecret,
    appearance,
  };

  // If we don't have a clientSecret yet (loading from API), show a skeleton/loader
  if (!clientSecret) {
    return (
      <Card className="max-w-md mx-auto py-12 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-sm font-bold text-slate-400">Initializing Secure Checkout...</p>
      </Card>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6 animate-in fade-in zoom-in duration-500">
      {/* 1. Security Header */}
      <div className="flex items-center justify-center gap-6 mb-2">
        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <Lock size={12} />
          SSL Encrypted
        </div>
        <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
          <ShieldCheck size={12} />
          PCI Compliant
        </div>
      </div>

      {/* 2. Stripe Context Provider */}
      <Elements stripe={stripePromise} options={options}>
        <div className="space-y-6">
          {/* Summary Header for the Payment */}
          {amount && (
            <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-xs font-bold text-indigo-100 uppercase tracking-widest mb-1">Total Amount</p>
                <h2 className="text-3xl font-black">${(amount / 100).toFixed(2)}</h2>
              </div>
              <CreditCard className="absolute -right-4 -bottom-4 text-white/10 w-32 h-32 rotate-12" />
            </div>
          )}
          
          {children}
        </div>
      </Elements>

      {/* 3. Payment Methods Disclaimer */}
      <p className="text-center text-[10px] text-slate-400 leading-relaxed px-8">
        By confirming your payment, you agree to CareSync's Terms of Service and Privacy Policy. 
        Your consultation fee is processed securely via Stripe.
      </p>
    </div>
  );
};

export default StripeElementsWrapper;