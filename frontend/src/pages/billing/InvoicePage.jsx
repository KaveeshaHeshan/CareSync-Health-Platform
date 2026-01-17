import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Printer,
  CheckCircle,
  Calendar,
  Clock,
  User,
  CreditCard,
  FileText,
  Building2,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import appointmentApi from '../../api/appointmentApi';
import paymentApi from '../../api/paymentApi';

const InvoicePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const invoiceRef = useRef();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [invoice, setInvoice] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    loadInvoice();
  }, []);

  const loadInvoice = async () => {
    try {
      setLoading(true);
      const paymentId = searchParams.get('paymentId');
      const appointmentId = searchParams.get('appointmentId');

      if (!paymentId && !appointmentId) {
        setError('Invalid invoice parameters');
        setLoading(false);
        return;
      }

      // Fetch payment details
      let paymentData;
      if (paymentId) {
        const response = await paymentApi.getPaymentById(paymentId);
        paymentData = response.payment;
      } else {
        // If only appointmentId, fetch the latest payment for that appointment
        const response = await paymentApi.getPaymentByAppointment(appointmentId);
        paymentData = response.payment;
      }

      // Fetch appointment details
      const appointmentResponse = await appointmentApi.getAppointmentById(
        paymentData.appointmentId || appointmentId
      );

      setInvoice({
        ...paymentData,
        appointment: appointmentResponse.appointment
      });

      setLoading(false);
    } catch (err) {
      console.error('Error loading invoice:', err);
      setError(err.response?.data?.message || 'Failed to load invoice');
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);
      
      // Create a printable version
      const printContent = invoiceRef.current;
      const windowContent = document.documentElement.innerHTML;
      
      // Create new window with invoice content
      const printWindow = window.open('', '', 'width=800,height=600');
      printWindow.document.write('<html><head><title>Invoice</title>');
      printWindow.document.write('<style>');
      printWindow.document.write(`
        body { font-family: Arial, sans-serif; padding: 20px; }
        .invoice-container { max-width: 800px; margin: 0 auto; }
        .invoice-header { text-align: center; margin-bottom: 30px; }
        .invoice-header h1 { color: #4f46e5; margin: 0; }
        .invoice-info { display: flex; justify-content: space-between; margin-bottom: 20px; }
        .invoice-section { margin-bottom: 20px; }
        .invoice-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .invoice-table th, .invoice-table td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        .invoice-table th { background-color: #f9fafb; font-weight: 600; }
        .total-row { font-weight: bold; background-color: #f9fafb; }
        .invoice-footer { margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280; }
        @media print { .no-print { display: none; } }
      `);
      printWindow.document.write('</style></head><body>');
      printWindow.document.write(printContent.innerHTML);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      
      // Trigger print dialog which allows "Save as PDF"
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
        setDownloading(false);
      }, 250);
      
    } catch (err) {
      console.error('Error downloading PDF:', err);
      alert('Failed to download PDF');
      setDownloading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
        <div className="max-w-2xl mx-auto">
          <Alert type="error" message={error} />
          <Button
            onClick={() => navigate('/patient/billing')}
            className="mt-4"
          >
            <ArrowLeft size={20} />
            Back to Billing
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Actions - No Print */}
        <div className="flex items-center justify-between mb-6 no-print">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            Back
          </Button>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handlePrint}
              className="flex items-center gap-2"
            >
              <Printer size={20} />
              Print
            </Button>
            <Button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="flex items-center gap-2"
            >
              {downloading ? (
                <Spinner size="sm" />
              ) : (
                <Download size={20} />
              )}
              Download PDF
            </Button>
          </div>
        </div>

        {/* Invoice Content */}
        <div ref={invoiceRef}>
          <Card className="p-8 bg-white shadow-lg">
            {/* Company Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Building2 className="text-white" size={24} />
                </div>
                <h1 className="text-3xl font-bold text-indigo-600">CareSync</h1>
              </div>
              <p className="text-slate-600">Professional Healthcare Platform</p>
            </div>

            {/* Invoice Title & Status */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b-2 border-slate-200">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-1">INVOICE</h2>
                <p className="text-slate-600">
                  Invoice #: <span className="font-semibold">{invoice.transactionId || invoice._id?.slice(-8).toUpperCase()}</span>
                </p>
              </div>
              <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg">
                <CheckCircle className="text-green-600" size={24} />
                <span className="font-semibold text-green-700">PAID</span>
              </div>
            </div>

            {/* Company & Customer Info */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* From */}
              <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase mb-3">From</h3>
                <div className="space-y-2">
                  <p className="font-semibold text-slate-800">CareSync Health Platform</p>
                  <div className="flex items-start gap-2 text-sm text-slate-600">
                    <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                    <span>123 Healthcare Ave, Medical District<br />New York, NY 10001</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone size={16} />
                    <span>+1 (555) 123-4567</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Mail size={16} />
                    <span>billing@caresync.com</span>
                  </div>
                </div>
              </div>

              {/* To */}
              <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase mb-3">Bill To</h3>
                <div className="space-y-2">
                  <p className="font-semibold text-slate-800">
                    {invoice.appointment?.patient?.name || 'Patient Name'}
                  </p>
                  {invoice.billingAddress && (
                    <div className="flex items-start gap-2 text-sm text-slate-600">
                      <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                      <span>
                        {invoice.billingAddress.street}<br />
                        {invoice.billingAddress.city}, {invoice.billingAddress.state} {invoice.billingAddress.zip}<br />
                        {invoice.billingAddress.country}
                      </span>
                    </div>
                  )}
                  {invoice.appointment?.patient?.email && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail size={16} />
                      <span>{invoice.appointment.patient.email}</span>
                    </div>
                  )}
                  {invoice.appointment?.patient?.phone && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone size={16} />
                      <span>{invoice.appointment.patient.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Invoice Details */}
            <div className="grid md:grid-cols-3 gap-4 mb-8 bg-slate-50 p-4 rounded-lg">
              <div>
                <p className="text-xs text-slate-500 uppercase mb-1">Invoice Date</p>
                <p className="font-semibold text-slate-800">
                  {formatDate(invoice.createdAt || invoice.paymentDate)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase mb-1">Payment Method</p>
                <p className="font-semibold text-slate-800">
                  {invoice.paymentMethod || 'Credit Card'} •••• {invoice.last4Digits || '****'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase mb-1">Transaction ID</p>
                <p className="font-semibold text-slate-800 text-sm">
                  {invoice.transactionId || `TXN${Date.now().toString().slice(-10)}`}
                </p>
              </div>
            </div>

            {/* Appointment Details */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-slate-500 uppercase mb-4">Appointment Details</h3>
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg">
                <div className="flex items-start gap-4">
                  {/* Doctor Avatar */}
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                    {invoice.appointment?.doctor?.name?.charAt(0) || 'D'}
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-800 text-lg mb-1">
                      Dr. {invoice.appointment?.doctor?.name || 'Doctor Name'}
                    </h4>
                    <p className="text-slate-600 text-sm mb-3">
                      {invoice.appointment?.doctor?.specialization || 'Specialist'}
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="text-indigo-600" size={16} />
                        <span className="text-slate-700">
                          {invoice.appointment?.date ? formatDate(invoice.appointment.date) : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="text-indigo-600" size={16} />
                        <span className="text-slate-700">
                          {invoice.appointment?.time || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="text-indigo-600" size={16} />
                        <span className="text-slate-700">
                          Type: <span className="capitalize">{invoice.appointment?.type || 'online'}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <User className="text-indigo-600" size={16} />
                        <span className="text-slate-700">
                          Status: <span className="capitalize font-semibold text-green-600">
                            {invoice.appointment?.status || 'confirmed'}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Invoice Table */}
            <div className="mb-8">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="text-left py-3 text-sm font-semibold text-slate-700 uppercase">Description</th>
                    <th className="text-right py-3 text-sm font-semibold text-slate-700 uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="py-4 text-slate-700">
                      <div className="font-medium">Consultation Fee</div>
                      <div className="text-sm text-slate-500">
                        {invoice.appointment?.type === 'online' ? 'Online' : 'In-Person'} Consultation with Dr. {invoice.appointment?.doctor?.name}
                      </div>
                    </td>
                    <td className="py-4 text-right text-slate-700 font-semibold">
                      ${invoice.consultationFee || invoice.appointment?.amount || '0.00'}
                    </td>
                  </tr>

                  <tr className="border-b border-slate-100">
                    <td className="py-4 text-slate-700">
                      <div className="font-medium">Platform Fee</div>
                      <div className="text-sm text-slate-500">Service charge</div>
                    </td>
                    <td className="py-4 text-right text-slate-700 font-semibold">
                      ${invoice.platformFee || '5.00'}
                    </td>
                  </tr>

                  <tr className="border-b border-slate-100">
                    <td className="py-4 text-slate-700">
                      <div className="font-medium">Tax (8%)</div>
                      <div className="text-sm text-slate-500">Sales tax</div>
                    </td>
                    <td className="py-4 text-right text-slate-700 font-semibold">
                      ${invoice.tax || ((parseFloat(invoice.consultationFee || invoice.appointment?.amount || 0) + parseFloat(invoice.platformFee || 5)) * 0.08).toFixed(2)}
                    </td>
                  </tr>

                  <tr className="border-t-2 border-slate-300 bg-slate-50">
                    <td className="py-4 text-slate-800 font-bold text-lg">TOTAL PAID</td>
                    <td className="py-4 text-right text-indigo-600 font-bold text-2xl">
                      ${invoice.totalAmount || invoice.amount || '0.00'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Payment Status */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
              <div className="flex items-center gap-3">
                <CheckCircle className="text-green-600" size={24} />
                <div>
                  <p className="font-semibold text-green-800">Payment Successful</p>
                  <p className="text-sm text-green-700">
                    Your payment has been processed successfully on {formatDate(invoice.createdAt || invoice.paymentDate)} at {formatTime(invoice.createdAt || invoice.paymentDate)}
                  </p>
                </div>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-slate-500 uppercase mb-2">Notes</h3>
                <p className="text-slate-600 text-sm">{invoice.notes}</p>
              </div>
            )}

            {/* Footer */}
            <div className="pt-8 border-t border-slate-200 text-center">
              <p className="text-sm text-slate-600 mb-2">
                Thank you for choosing CareSync Health Platform!
              </p>
              <p className="text-xs text-slate-500">
                This is a computer-generated invoice and does not require a signature.
              </p>
              <p className="text-xs text-slate-500 mt-2">
                For any queries, please contact us at billing@caresync.com or call +1 (555) 123-4567
              </p>
            </div>
          </Card>
        </div>

        {/* Additional Info - No Print */}
        <div className="mt-6 no-print">
          <Card className="p-4 bg-indigo-50 border border-indigo-200">
            <div className="flex items-start gap-3">
              <FileText className="text-indigo-600 flex-shrink-0" size={20} />
              <div className="text-sm text-indigo-900">
                <p className="font-semibold mb-1">Need help?</p>
                <p>
                  If you have any questions about this invoice or need a receipt for insurance purposes, 
                  please contact our billing department at billing@caresync.com
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body { margin: 0; padding: 0; }
          .no-print { display: none !important; }
          .min-h-screen { min-height: auto; }
          .bg-gradient-to-br { background: white !important; }
        }
      `}</style>
    </div>
  );
};

export default InvoicePage;
