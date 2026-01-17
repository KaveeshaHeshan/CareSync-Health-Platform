import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  CreditCard, 
  Lock, 
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Calendar,
  User,
  DollarSign,
  Clock,
  MapPin,
  Stethoscope,
  ShieldCheck,
  Info
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import appointmentApi from '../../api/appointmentApi';
import paymentApi from '../../api/paymentApi';

const PaymentPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const appointmentId = searchParams.get('appointmentId');

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [appointment, setAppointment] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Payment form state
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });
  const [billingAddress, setBillingAddress] = useState({
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
  });
  const [saveCard, setSaveCard] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  useEffect(() => {
    if (appointmentId) {
      fetchAppointmentDetails();
    } else {
      setError('No appointment ID provided');
      setLoading(false);
    }
  }, [appointmentId]);

  const fetchAppointmentDetails = async () => {
    try {
      setLoading(true);
      const response = await appointmentApi.getAppointmentById(appointmentId);
      setAppointment(response.appointment);
    } catch (err) {
      setError('Failed to load appointment details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\s/g, '');
    value = value.replace(/\D/g, '');
    value = value.substring(0, 16);
    value = value.match(/.{1,4}/g)?.join(' ') || value;
    setCardDetails({ ...cardDetails, cardNumber: value });
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    setCardDetails({ ...cardDetails, expiryDate: value });
  };

  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 4);
    setCardDetails({ ...cardDetails, cvv: value });
  };

  const validateForm = () => {
    if (paymentMethod === 'card') {
      if (!cardDetails.cardNumber || cardDetails.cardNumber.replace(/\s/g, '').length !== 16) {
        setError('Please enter a valid card number');
        return false;
      }
      if (!cardDetails.cardName) {
        setError('Please enter cardholder name');
        return false;
      }
      if (!cardDetails.expiryDate || cardDetails.expiryDate.length !== 5) {
        setError('Please enter valid expiry date (MM/YY)');
        return false;
      }
      if (!cardDetails.cvv || cardDetails.cvv.length < 3) {
        setError('Please enter valid CVV');
        return false;
      }
    }

    if (!billingAddress.address || !billingAddress.city || !billingAddress.zipCode) {
      setError('Please complete billing address');
      return false;
    }

    if (!acceptTerms) {
      setError('Please accept terms and conditions');
      return false;
    }

    return true;
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    try {
      setProcessing(true);

      const paymentData = {
        appointmentId: appointment._id,
        amount: appointment.amount,
        paymentMethod,
        cardDetails: paymentMethod === 'card' ? {
          cardNumber: cardDetails.cardNumber.replace(/\s/g, ''),
          cardName: cardDetails.cardName,
          expiryDate: cardDetails.expiryDate,
          cvv: cardDetails.cvv,
        } : null,
        billingAddress,
        saveCard,
      };

      const response = await paymentApi.processPayment(paymentData);

      if (response.success) {
        setSuccess('Payment processed successfully!');
        
        // Wait 2 seconds then redirect
        setTimeout(() => {
          navigate('/patient/appointments');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const calculateTax = (amount) => {
    return (amount * 0.08).toFixed(2); // 8% tax
  };

  const calculateTotal = (amount) => {
    const tax = parseFloat(calculateTax(amount));
    return (parseFloat(amount) + tax).toFixed(2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full p-8 text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Appointment Not Found</h2>
          <p className="text-gray-600 mb-6">
            The appointment you're trying to pay for could not be found.
          </p>
          <Button onClick={() => navigate('/patient/appointments')}>
            Go to Appointments
          </Button>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-green-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-6">
            Your payment has been processed successfully. You will be redirected to your appointments.
          </p>
          <div className="space-y-3">
            <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Amount Paid:</span>
              <span className="font-semibold text-green-600">
                ${calculateTotal(appointment.amount)}
              </span>
            </div>
            <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Payment Method:</span>
              <span className="font-medium text-gray-900">
                {paymentMethod === 'card' ? '•••• ' + cardDetails.cardNumber.slice(-4) : paymentMethod}
              </span>
            </div>
          </div>
          <Button onClick={() => navigate('/patient/appointments')} className="mt-6 w-full">
            Go to Appointments
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <CreditCard className="text-indigo-600" size={32} />
            Complete Payment
          </h1>
          <p className="text-gray-600 mt-1">Secure payment for your appointment</p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Method Selection */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 border-2 rounded-xl transition-all ${
                    paymentMethod === 'card'
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <CreditCard className={`mx-auto mb-2 ${paymentMethod === 'card' ? 'text-indigo-600' : 'text-gray-400'}`} size={24} />
                  <p className={`text-sm font-medium ${paymentMethod === 'card' ? 'text-indigo-900' : 'text-gray-600'}`}>
                    Credit Card
                  </p>
                </button>
                <button
                  onClick={() => setPaymentMethod('debit')}
                  className={`p-4 border-2 rounded-xl transition-all ${
                    paymentMethod === 'debit'
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <CreditCard className={`mx-auto mb-2 ${paymentMethod === 'debit' ? 'text-indigo-600' : 'text-gray-400'}`} size={24} />
                  <p className={`text-sm font-medium ${paymentMethod === 'debit' ? 'text-indigo-900' : 'text-gray-600'}`}>
                    Debit Card
                  </p>
                </button>
                <button
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-4 border-2 rounded-xl transition-all ${
                    paymentMethod === 'upi'
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <DollarSign className={`mx-auto mb-2 ${paymentMethod === 'upi' ? 'text-indigo-600' : 'text-gray-400'}`} size={24} />
                  <p className={`text-sm font-medium ${paymentMethod === 'upi' ? 'text-indigo-900' : 'text-gray-600'}`}>
                    UPI
                  </p>
                </button>
              </div>
            </Card>

            {/* Card Details */}
            {(paymentMethod === 'card' || paymentMethod === 'debit') && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard size={20} />
                  Card Details
                </h3>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Number
                    </label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={cardDetails.cardNumber}
                      onChange={handleCardNumberChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={cardDetails.cardName}
                      onChange={(e) => setCardDetails({ ...cardDetails, cardName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={cardDetails.expiryDate}
                        onChange={handleExpiryChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVV
                      </label>
                      <input
                        type="password"
                        placeholder="123"
                        value={cardDetails.cvv}
                        onChange={handleCvvChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-4 bg-indigo-50 rounded-xl">
                    <input
                      type="checkbox"
                      id="saveCard"
                      checked={saveCard}
                      onChange={(e) => setSaveCard(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor="saveCard" className="text-sm text-gray-700">
                      Save card for future payments
                    </label>
                  </div>
                </form>
              </Card>
            )}

            {/* UPI Payment */}
            {paymentMethod === 'upi' && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign size={20} />
                  UPI Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      UPI ID
                    </label>
                    <input
                      type="text"
                      placeholder="yourname@upi"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <p className="text-sm text-blue-800">
                      <Info className="inline mr-2" size={16} />
                      You will receive a payment request on your UPI app to complete this transaction.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Billing Address */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin size={20} />
                Billing Address
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    placeholder="123 Main Street"
                    value={billingAddress.address}
                    onChange={(e) => setBillingAddress({ ...billingAddress, address: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      placeholder="New York"
                      value={billingAddress.city}
                      onChange={(e) => setBillingAddress({ ...billingAddress, city: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      placeholder="NY"
                      value={billingAddress.state}
                      onChange={(e) => setBillingAddress({ ...billingAddress, state: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      placeholder="10001"
                      value={billingAddress.zipCode}
                      onChange={(e) => setBillingAddress({ ...billingAddress, zipCode: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <select
                      value={billingAddress.country}
                      onChange={(e) => setBillingAddress({ ...billingAddress, country: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option>United States</option>
                      <option>Canada</option>
                      <option>United Kingdom</option>
                      <option>India</option>
                      <option>Australia</option>
                    </select>
                  </div>
                </div>
              </div>
            </Card>

            {/* Terms and Conditions */}
            <Card className="p-6">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mt-1"
                />
                <label htmlFor="terms" className="text-sm text-gray-700">
                  I agree to the <a href="/terms" className="text-indigo-600 hover:underline">Terms and Conditions</a> and <a href="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</a>. I authorize CareSync to charge my payment method for this appointment.
                </label>
              </div>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              
              {/* Appointment Details */}
              <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                    {appointment.doctor?.name?.split(' ').map(n => n[0]).join('') || 'Dr'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{appointment.doctor?.name || 'Doctor'}</p>
                    <p className="text-sm text-gray-600">{appointment.doctor?.specialization || 'Specialist'}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={16} />
                    <span>{new Date(appointment.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock size={16} />
                    <span>{appointment.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Stethoscope size={16} />
                    <Badge className={appointment.type === 'online' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}>
                      {appointment.type === 'online' ? 'Online Consultation' : 'In-Person Visit'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Consultation Fee</span>
                  <span className="font-medium text-gray-900">${appointment.amount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Platform Fee</span>
                  <span className="font-medium text-gray-900">$5.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (8%)</span>
                  <span className="font-medium text-gray-900">${calculateTax(appointment.amount)}</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                <span className="text-2xl font-bold text-indigo-600">
                  ${calculateTotal(appointment.amount)}
                </span>
              </div>

              {/* Pay Button */}
              <Button
                onClick={handleSubmitPayment}
                disabled={processing}
                className="w-full flex items-center justify-center gap-2 py-3"
              >
                {processing ? (
                  <>
                    <Spinner size="sm" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock size={20} />
                    Pay Now
                  </>
                )}
              </Button>

              {/* Security Badge */}
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center gap-2 text-green-800 text-sm">
                  <ShieldCheck size={20} />
                  <span className="font-medium">Secure Payment</span>
                </div>
                <p className="text-xs text-green-700 mt-1">
                  Your payment information is encrypted and secure. We never store your full card details.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
