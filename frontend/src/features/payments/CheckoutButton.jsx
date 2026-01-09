import React, { useState } from 'react';
import { CreditCard, Lock, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';

// Relative imports based on your shared UI kit
import Button from '../../components/ui/Button';
import NotificationToast from '../../components/shared/NotificationToast';

const CheckoutButton = ({ 
  priceId, 
  amount, 
  label = "Proceed to Payment", 
  type = "consultation" // 'subscription' or 'consultation'
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Call your backend to create the Checkout Session
      // const response = await fetch('/api/create-checkout-session', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ priceId, type }),
      // });
      // const { url } = await response.json();

      // Mocking the redirect delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 2. Redirect to the Stripe Hosted Checkout page
      // window.location.href = url;
      console.log(`Redirecting to checkout for ${type}...`);
      
    } catch (err) {
      setError("Unable to initiate checkout. Please try again.");
      console.error("Stripe Checkout Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-3">
      {error && (
        <NotificationToast 
          type="error" 
          message="Payment Error" 
          description={error} 
          onClose={() => setError(null)}
        />
      )}

      <Button
        variant="primary"
        size="lg"
        className="w-full py-6 text-base shadow-xl shadow-indigo-100 group relative overflow-hidden"
        onClick={handleCheckout}
        disabled={isLoading}
      >
        <div className="relative z-10 flex items-center justify-center gap-2">
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              <span>Verifying Session...</span>
            </>
          ) : (
            <>
              <CreditCard size={20} className="group-hover:rotate-12 transition-transform" />
              <span>{label}</span>
              <ArrowRight size={18} className="ml-1 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </div>
        
        {/* Subtle hover effect background */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity" />
      </Button>

      {/* Trust Signals */}
      <div className="flex items-center justify-center gap-4 py-2">
        <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <Lock size={12} className="text-slate-300" />
          Secured by Stripe
        </div>
        <div className="w-1 h-1 bg-slate-200 rounded-full" />
        <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
          <ShieldCheck size={12} />
          PCI Compliant
        </div>
      </div>

      {amount && (
        <p className="text-center text-[11px] text-slate-400 font-medium">
          You will be charged <span className="text-slate-600 font-bold">${(amount / 100).toFixed(2)}</span> once the session is confirmed.
        </p>
      )}
    </div>
  );
};

export default CheckoutButton;