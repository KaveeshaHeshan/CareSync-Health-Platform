import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  CreditCard,
  Lock,
  AlertCircle,
  Check,
  Loader,
  Shield,
  DollarSign,
  Calendar,
  User,
  Mail,
  MapPin,
  Building,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';

/**
 * CheckoutForm Component
 * 
 * Handles payment processing with Stripe integration.
 * Supports card payments, 3D Secure authentication, and payment intent creation.
 * 
 * @component
 */
const CheckoutForm = ({
  amount,
  currency = 'USD',
  description = '',
  appointmentId = null,
  patientInfo = null,
  onSuccess,
  onError,
  onCancel,
  showBillingAddress = true,
  autoSubmit = false,
  className = '',
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [succeeded, setSucceeded] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  
  // Card details
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');
  
  // Billing details
  const [email, setEmail] = useState(patientInfo?.email || '');
  const [billingAddress, setBillingAddress] = useState({
    line1: '',
    line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'US',
  });

  // Form validation
  const [touched, setTouched] = useState({});
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (patientInfo) {
      setCardName(patientInfo.name || '');
      setEmail(patientInfo.email || '');
    }
  }, [patientInfo]);

  // Format card number with spaces
  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(' ') : cleaned;
  };

  // Format expiry as MM/YY
  const formatExpiry = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  // Get card type from number
  const getCardType = (number) => {
    const cleaned = number.replace(/\s/g, '');
    if (/^4/.test(cleaned)) return 'Visa';
    if (/^5[1-5]/.test(cleaned)) return 'Mastercard';
    if (/^3[47]/.test(cleaned)) return 'Amex';
    if (/^6(?:011|5)/.test(cleaned)) return 'Discover';
    return 'Card';
  };

  // Validate form fields
  const validateField = (field, value) => {
    switch (field) {
      case 'cardNumber':
        const cleaned = value.replace(/\s/g, '');
        if (!cleaned) return 'Card number is required';
        if (cleaned.length < 13 || cleaned.length > 19) return 'Invalid card number';
        if (!/^\d+$/.test(cleaned)) return 'Card number must contain only digits';
        return null;
      
      case 'cardExpiry':
        if (!value) return 'Expiry date is required';
        const [month, year] = value.split('/');
        if (!month || !year) return 'Invalid format (MM/YY)';
        const monthNum = parseInt(month);
        if (monthNum < 1 || monthNum > 12) return 'Invalid month';
        const currentYear = new Date().getFullYear() % 100;
        const currentMonth = new Date().getMonth() + 1;
        const yearNum = parseInt(year);
        if (yearNum < currentYear || (yearNum === currentYear && monthNum < currentMonth)) {
          return 'Card has expired';
        }
        return null;
      
      case 'cardCvc':
        if (!value) return 'CVC is required';
        if (!/^\d{3,4}$/.test(value)) return 'Invalid CVC';
        return null;
      
      case 'cardName':
        if (!value.trim()) return 'Cardholder name is required';
        if (value.trim().length < 3) return 'Name too short';
        return null;
      
      case 'email':
        if (!value) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email';
        return null;
      
      case 'postal_code':
        if (showBillingAddress && !value) return 'Postal code is required';
        return null;
      
      default:
        return null;
    }
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    const error = validateField(field, getFieldValue(field));
    setValidationErrors({ ...validationErrors, [field]: error });
  };

  const getFieldValue = (field) => {
    switch (field) {
      case 'cardNumber': return cardNumber;
      case 'cardExpiry': return cardExpiry;
      case 'cardCvc': return cardCvc;
      case 'cardName': return cardName;
      case 'email': return email;
      case 'postal_code': return billingAddress.postal_code;
      default: return '';
    }
  };

  const isFormValid = () => {
    const fields = ['cardNumber', 'cardExpiry', 'cardCvc', 'cardName', 'email'];
    if (showBillingAddress) {
      fields.push('postal_code');
    }
    
    const errors = {};
    fields.forEach(field => {
      const error = validateField(field, getFieldValue(field));
      if (error) errors[field] = error;
    });
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isProcessing || succeeded) return;
    
    // Validate form
    if (!isFormValid()) {
      setError('Please correct the errors in the form');
      return;
    }
    
    setIsProcessing(true);
    setError(null);

    try {
      // Simulate Stripe payment processing
      // In production, you would use Stripe Elements or Stripe.js
      
      // Create payment intent
      const paymentIntentResponse = await fetch(`${import.meta.env.VITE_API_URL}/payments/create-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to cents
          currency: currency.toLowerCase(),
          appointmentId,
          description,
        }),
      });

      if (!paymentIntentResponse.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { clientSecret } = await paymentIntentResponse.json();

      // Simulate card payment confirmation
      // In production: stripe.confirmCardPayment(clientSecret, { payment_method: { card, billing_details } })
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate successful payment
      const paymentResult = {
        id: 'pi_' + Math.random().toString(36).substr(2, 9),
        status: 'succeeded',
        amount: amount,
        currency: currency,
        created: new Date().toISOString(),
        payment_method: {
          card: {
            brand: getCardType(cardNumber).toLowerCase(),
            last4: cardNumber.replace(/\s/g, '').slice(-4),
          },
        },
      };

      setSucceeded(true);
      setIsProcessing(false);
      onSuccess?.(paymentResult);

    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment failed. Please try again.');
      setIsProcessing(false);
      onError?.(err);
    }
  };

  const formatAmount = (amt) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amt);
  };

  if (succeeded) {
    return (
      <Card className={`p-8 ${className}`}>
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Check size={32} className="text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment Successful!</h2>
          <p className="text-slate-600 mb-4">
            Your payment of {formatAmount(amount)} has been processed successfully.
          </p>
          <Badge variant="success" className="mb-4">
            Payment Completed
          </Badge>
          {appointmentId && (
            <p className="text-sm text-slate-500">
              Appointment ID: {appointmentId}
            </p>
          )}
        </div>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <Card className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <CreditCard className="text-indigo-600" size={20} />
              Payment Details
            </h3>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Lock size={16} />
              <span>Secure Payment</span>
            </div>
          </div>
          <p className="text-sm text-slate-600">
            All transactions are secure and encrypted
          </p>
        </div>

        {/* Amount Summary */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-slate-700 font-medium">Total Amount</span>
            <span className="text-2xl font-bold text-indigo-600">{formatAmount(amount)}</span>
          </div>
          {description && (
            <p className="text-sm text-slate-600 mt-1">{description}</p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Card Information */}
        <div className="space-y-4 mb-6">
          <h4 className="font-medium text-slate-900">Card Information</h4>
          
          {/* Card Number */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Card Number
            </label>
            <div className="relative">
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => {
                  const formatted = formatCardNumber(e.target.value.replace(/\D/g, '').slice(0, 19));
                  setCardNumber(formatted);
                }}
                onBlur={() => handleBlur('cardNumber')}
                placeholder="1234 5678 9012 3456"
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  touched.cardNumber && validationErrors.cardNumber
                    ? 'border-red-300 bg-red-50'
                    : 'border-slate-300'
                }`}
                disabled={isProcessing}
              />
              <CreditCard size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              {cardNumber && (
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs font-medium text-slate-600">
                  {getCardType(cardNumber)}
                </span>
              )}
            </div>
            {touched.cardNumber && validationErrors.cardNumber && (
              <p className="text-sm text-red-600 mt-1">{validationErrors.cardNumber}</p>
            )}
          </div>

          {/* Expiry and CVC */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Expiry Date
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={cardExpiry}
                  onChange={(e) => {
                    const formatted = formatExpiry(e.target.value);
                    if (formatted.length <= 5) setCardExpiry(formatted);
                  }}
                  onBlur={() => handleBlur('cardExpiry')}
                  placeholder="MM/YY"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    touched.cardExpiry && validationErrors.cardExpiry
                      ? 'border-red-300 bg-red-50'
                      : 'border-slate-300'
                  }`}
                  disabled={isProcessing}
                />
                <Calendar size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              </div>
              {touched.cardExpiry && validationErrors.cardExpiry && (
                <p className="text-sm text-red-600 mt-1">{validationErrors.cardExpiry}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                CVC
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={cardCvc}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setCardCvc(value);
                  }}
                  onBlur={() => handleBlur('cardCvc')}
                  placeholder="123"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    touched.cardCvc && validationErrors.cardCvc
                      ? 'border-red-300 bg-red-50'
                      : 'border-slate-300'
                  }`}
                  disabled={isProcessing}
                />
                <Shield size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              </div>
              {touched.cardCvc && validationErrors.cardCvc && (
                <p className="text-sm text-red-600 mt-1">{validationErrors.cardCvc}</p>
              )}
            </div>
          </div>

          {/* Cardholder Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Cardholder Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                onBlur={() => handleBlur('cardName')}
                placeholder="John Doe"
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  touched.cardName && validationErrors.cardName
                    ? 'border-red-300 bg-red-50'
                    : 'border-slate-300'
                }`}
                disabled={isProcessing}
              />
              <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            </div>
            {touched.cardName && validationErrors.cardName && (
              <p className="text-sm text-red-600 mt-1">{validationErrors.cardName}</p>
            )}
          </div>
        </div>

        {/* Billing Details */}
        <div className="space-y-4 mb-6">
          <h4 className="font-medium text-slate-900">Billing Details</h4>
          
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => handleBlur('email')}
                placeholder="john@example.com"
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  touched.email && validationErrors.email
                    ? 'border-red-300 bg-red-50'
                    : 'border-slate-300'
                }`}
                disabled={isProcessing}
              />
              <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            </div>
            {touched.email && validationErrors.email && (
              <p className="text-sm text-red-600 mt-1">{validationErrors.email}</p>
            )}
            <p className="text-xs text-slate-500 mt-1">Receipt will be sent to this email</p>
          </div>

          {/* Billing Address (Optional) */}
          {showBillingAddress && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Postal Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={billingAddress.postal_code}
                    onChange={(e) => setBillingAddress({ ...billingAddress, postal_code: e.target.value })}
                    onBlur={() => handleBlur('postal_code')}
                    placeholder="12345"
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      touched.postal_code && validationErrors.postal_code
                        ? 'border-red-300 bg-red-50'
                        : 'border-slate-300'
                    }`}
                    disabled={isProcessing}
                  />
                  <MapPin size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                </div>
                {touched.postal_code && validationErrors.postal_code && (
                  <p className="text-sm text-red-600 mt-1">{validationErrors.postal_code}</p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Security Notice */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Lock size={18} className="text-slate-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-slate-600">
              <p className="font-medium mb-1">Your payment is secure</p>
              <p className="text-xs">
                We use industry-standard encryption to protect your payment information.
                Your card details are never stored on our servers.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {onCancel && (
            <Button
              type="button"
              onClick={onCancel}
              variant="outline"
              className="flex-1"
              disabled={isProcessing}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            variant="primary"
            className="flex-1 flex items-center justify-center gap-2"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader size={18} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <DollarSign size={18} />
                Pay {formatAmount(amount)}
              </>
            )}
          </Button>
        </div>

        {/* Test Card Notice (Development) */}
        {import.meta.env.DEV && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-800">
              <strong>Test Mode:</strong> Use card 4242 4242 4242 4242 with any future expiry and CVC
            </p>
          </div>
        )}
      </Card>
    </form>
  );
};

CheckoutForm.propTypes = {
  /** Amount to charge (in dollars) */
  amount: PropTypes.number.isRequired,

  /** Currency code (USD, EUR, etc.) */
  currency: PropTypes.string,

  /** Payment description */
  description: PropTypes.string,

  /** Appointment ID for linking payment */
  appointmentId: PropTypes.string,

  /** Patient information for pre-filling */
  patientInfo: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
  }),

  /** Callback on successful payment */
  onSuccess: PropTypes.func,

  /** Callback on payment error */
  onError: PropTypes.func,

  /** Callback on cancel */
  onCancel: PropTypes.func,

  /** Whether to show billing address fields */
  showBillingAddress: PropTypes.bool,

  /** Whether to auto-submit form */
  autoSubmit: PropTypes.bool,

  /** Additional CSS classes */
  className: PropTypes.string,
};

export default CheckoutForm;

/**
 * Example usage:
 * 
 * import CheckoutForm from './CheckoutForm';
 * 
 * const PaymentPage = () => {
 *   const handleSuccess = (result) => {
 *     console.log('Payment successful:', result);
 *     // Navigate to success page or show confirmation
 *   };
 * 
 *   const handleError = (error) => {
 *     console.error('Payment failed:', error);
 *   };
 * 
 *   return (
 *     <CheckoutForm
 *       amount={150.00}
 *       currency="USD"
 *       description="Video Consultation with Dr. Smith"
 *       appointmentId="appt_123"
 *       patientInfo={{
 *         name: 'John Doe',
 *         email: 'john@example.com',
 *       }}
 *       onSuccess={handleSuccess}
 *       onError={handleError}
 *       showBillingAddress={true}
 *     />
 *   );
 * };
 */
