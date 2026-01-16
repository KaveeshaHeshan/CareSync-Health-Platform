import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Download,
  Mail,
  Printer,
  Share2,
  FileText,
  Check,
  Copy,
  AlertCircle,
  Building,
  User,
  Calendar,
  DollarSign,
  Phone,
  MapPin,
  CreditCard,
  Clock,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';

/**
 * InvoiceDownload Component
 * 
 * Comprehensive invoice preview and download component with PDF generation,
 * email functionality, and multiple template options
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} props.invoiceId - Invoice ID for fetching data
 * @param {Object} props.invoiceData - Invoice data object (alternative to invoiceId)
 * @param {Object} props.appointmentDetails - Appointment details
 * @param {Object} props.patientInfo - Patient information
 * @param {Object} props.doctorInfo - Doctor information
 * @param {Function} props.onDownload - Callback for download action
 * @param {Function} props.onEmail - Callback for email action
 * @param {string} props.template - Template type ('default', 'medical', 'receipt')
 * @param {Object} props.companyInfo - Company information
 */
const InvoiceDownload = ({
  invoiceId = null,
  invoiceData: initialInvoiceData = null,
  appointmentDetails = null,
  patientInfo = null,
  doctorInfo = null,
  onDownload = null,
  onEmail = null,
  template = 'default',
  companyInfo = {
    name: 'CareSync Healthcare',
    address: '123 Medical Center Drive',
    city: 'San Francisco, CA 94102',
    phone: '(555) 123-4567',
    email: 'billing@caresync.com',
    website: 'www.caresync.com',
    taxId: '12-3456789',
  },
  className = '',
}) => {
  // State management
  const [invoiceData, setInvoiceData] = useState(initialInvoiceData);
  const [loading, setLoading] = useState(!initialInvoiceData && !!invoiceId);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [emailing, setEmailing] = useState(false);
  const [printing, setPrinting] = useState(false);
  
  // Email modal state
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState(patientInfo?.email || '');
  const [emailSent, setEmailSent] = useState(false);
  
  // Share modal state
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  
  // Invoice ref for printing
  const invoiceRef = useRef(null);

  // Fetch invoice data if invoiceId provided
  React.useEffect(() => {
    if (invoiceId && !initialInvoiceData) {
      fetchInvoiceData();
    }
  }, [invoiceId]);

  // Generate invoice data from props if not provided
  React.useEffect(() => {
    if (!invoiceData && appointmentDetails) {
      generateInvoiceFromAppointment();
    }
  }, [appointmentDetails]);

  const fetchInvoiceData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulated API call - replace with actual API
      const response = await fetch(`${import.meta.env.VITE_API_URL}/payments/invoice/${invoiceId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch invoice');
      
      const data = await response.json();
      setInvoiceData(data.invoice);
    } catch (err) {
      console.error('Error fetching invoice:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateInvoiceFromAppointment = () => {
    const now = new Date();
    const invoiceNumber = `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Math.floor(Math.random() * 10000)}`;
    
    const items = [
      {
        description: appointmentDetails.type === 'online' 
          ? 'Online Consultation' 
          : 'In-Person Consultation',
        quantity: 1,
        unitPrice: appointmentDetails.amount || doctorInfo?.fees || 100,
        total: appointmentDetails.amount || doctorInfo?.fees || 100,
      },
    ];

    // Add additional services if any
    if (appointmentDetails.services) {
      appointmentDetails.services.forEach((service) => {
        items.push({
          description: service.name,
          quantity: service.quantity || 1,
          unitPrice: service.price,
          total: (service.quantity || 1) * service.price,
        });
      });
    }

    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const taxRate = 0.08; // 8% tax
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;

    setInvoiceData({
      invoiceNumber,
      invoiceDate: now.toISOString(),
      dueDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      status: appointmentDetails.isPaid ? 'paid' : 'pending',
      items,
      subtotal,
      taxRate: taxRate * 100,
      taxAmount,
      total,
      paymentMethod: appointmentDetails.paymentMethod || 'card',
      transactionId: appointmentDetails.transactionId,
    });
  };

  // Download invoice as PDF
  const handleDownload = async () => {
    if (onDownload) {
      setDownloading(true);
      try {
        await onDownload(invoiceData);
      } catch (err) {
        console.error('Download error:', err);
        alert('Failed to download invoice');
      } finally {
        setDownloading(false);
      }
      return;
    }

    // Default download implementation using browser print
    try {
      setDownloading(true);
      
      // Create a new window with invoice content
      const printWindow = window.open('', '_blank');
      printWindow.document.write(generatePrintableHTML());
      printWindow.document.close();
      
      // Wait for content to load
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download invoice');
    } finally {
      setDownloading(false);
    }
  };

  // Email invoice
  const handleEmail = async () => {
    if (!emailRecipient.trim()) {
      alert('Please enter a valid email address');
      return;
    }

    if (onEmail) {
      setEmailing(true);
      try {
        await onEmail(invoiceData, emailRecipient);
        setEmailSent(true);
        setTimeout(() => {
          setShowEmailModal(false);
          setEmailSent(false);
        }, 2000);
      } catch (err) {
        console.error('Email error:', err);
        alert('Failed to send email');
      } finally {
        setEmailing(false);
      }
      return;
    }

    // Default email implementation - simulated
    try {
      setEmailing(true);
      
      // Simulated API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      setEmailSent(true);
      setTimeout(() => {
        setShowEmailModal(false);
        setEmailSent(false);
      }, 2000);
    } catch (err) {
      console.error('Email error:', err);
      alert('Failed to send email');
    } finally {
      setEmailing(false);
    }
  };

  // Print invoice
  const handlePrint = () => {
    setPrinting(true);
    
    // Use browser print API
    setTimeout(() => {
      window.print();
      setPrinting(false);
    }, 100);
  };

  // Share invoice
  const handleShare = () => {
    const link = `${window.location.origin}/invoice/${invoiceData.invoiceNumber}`;
    setShareLink(link);
    setShowShareModal(true);
  };

  // Copy share link
  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  // Generate printable HTML
  const generatePrintableHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${invoiceData.invoiceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
            .company-info { text-align: left; }
            .invoice-info { text-align: right; }
            .section { margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f8f9fa; font-weight: 600; }
            .totals { text-align: right; margin-top: 20px; }
            .totals table { width: 300px; margin-left: auto; }
            .footer { margin-top: 60px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          ${invoiceRef.current?.innerHTML || ''}
        </body>
      </html>
    `;
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      paid: { variant: 'success', label: 'Paid' },
      pending: { variant: 'warning', label: 'Pending' },
      overdue: { variant: 'danger', label: 'Overdue' },
      cancelled: { variant: 'default', label: 'Cancelled' },
    };

    const config = statusConfig[status] || statusConfig.pending;
    
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Loading state
  if (loading) {
    return (
      <Card className={className}>
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
          <span className="ml-3 text-slate-600">Loading invoice...</span>
        </div>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className={className}>
        <div className="p-6 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Error Loading Invoice</h3>
          <p className="text-slate-600 mb-4">{error}</p>
          <Button onClick={fetchInvoiceData}>Try Again</Button>
        </div>
      </Card>
    );
  }

  // No data state
  if (!invoiceData) {
    return (
      <Card className={className}>
        <div className="p-6 text-center">
          <FileText className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Invoice Data</h3>
          <p className="text-slate-600">Invoice data is not available.</p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className={className}>
        {/* Action Bar */}
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Invoice</h2>
              <p className="text-sm text-slate-600 mt-1">
                {invoiceData.invoiceNumber}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={downloading}
                className="flex items-center gap-2"
              >
                {downloading ? (
                  <Spinner size="sm" />
                ) : (
                  <Download size={18} />
                )}
                Download PDF
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEmailModal(true)}
                className="flex items-center gap-2"
              >
                <Mail size={18} />
                Email
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                disabled={printing}
                className="flex items-center gap-2"
              >
                {printing ? (
                  <Spinner size="sm" />
                ) : (
                  <Printer size={18} />
                )}
                Print
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="flex items-center gap-2"
              >
                <Share2 size={18} />
                Share
              </Button>
            </div>
          </div>
        </div>

        {/* Invoice Content */}
        <div ref={invoiceRef} className="p-8 md:p-12 bg-white">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xl">
                  C
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">
                    {companyInfo.name}
                  </h1>
                </div>
              </div>
              <div className="text-sm text-slate-600 space-y-1">
                <div className="flex items-center gap-2">
                  <Building size={14} />
                  {companyInfo.address}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={14} />
                  {companyInfo.city}
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} />
                  {companyInfo.phone}
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={14} />
                  {companyInfo.email}
                </div>
              </div>
            </div>

            {/* Invoice Info */}
            <div className="text-right">
              <div className="text-3xl font-bold text-slate-900 mb-2">INVOICE</div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-slate-600">Invoice Number:</span>
                  <div className="font-semibold text-slate-900">
                    {invoiceData.invoiceNumber}
                  </div>
                </div>
                <div>
                  <span className="text-slate-600">Invoice Date:</span>
                  <div className="font-semibold text-slate-900">
                    {formatDate(invoiceData.invoiceDate)}
                  </div>
                </div>
                <div>
                  <span className="text-slate-600">Due Date:</span>
                  <div className="font-semibold text-slate-900">
                    {formatDate(invoiceData.dueDate)}
                  </div>
                </div>
                <div>
                  <span className="text-slate-600">Status:</span>
                  <div className="inline-block mt-1">
                    {getStatusBadge(invoiceData.status)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bill To / Service Provider */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Bill To */}
            {patientInfo && (
              <div>
                <h3 className="text-sm font-semibold text-slate-900 uppercase mb-3">
                  Bill To
                </h3>
                <div className="text-sm text-slate-700 space-y-1">
                  <div className="font-semibold">{patientInfo.name}</div>
                  {patientInfo.email && <div>{patientInfo.email}</div>}
                  {patientInfo.phone && <div>{patientInfo.phone}</div>}
                  {patientInfo.address && (
                    <>
                      <div>{patientInfo.address.line1}</div>
                      {patientInfo.address.line2 && <div>{patientInfo.address.line2}</div>}
                      <div>
                        {patientInfo.address.city}, {patientInfo.address.state}{' '}
                        {patientInfo.address.postal_code}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Service Provider */}
            {doctorInfo && (
              <div>
                <h3 className="text-sm font-semibold text-slate-900 uppercase mb-3">
                  Service Provider
                </h3>
                <div className="text-sm text-slate-700 space-y-1">
                  <div className="font-semibold">Dr. {doctorInfo.name}</div>
                  {doctorInfo.specialization && (
                    <div className="text-slate-600">{doctorInfo.specialization}</div>
                  )}
                  {doctorInfo.email && <div>{doctorInfo.email}</div>}
                  {doctorInfo.phone && <div>{doctorInfo.phone}</div>}
                </div>
              </div>
            )}
          </div>

          {/* Appointment Details */}
          {appointmentDetails && (
            <div className="mb-8 p-4 bg-slate-50 rounded-lg">
              <h3 className="text-sm font-semibold text-slate-900 uppercase mb-3">
                Appointment Details
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-slate-600 mb-1">Date</div>
                  <div className="font-medium text-slate-900 flex items-center gap-1">
                    <Calendar size={14} />
                    {formatDate(appointmentDetails.date)}
                  </div>
                </div>
                <div>
                  <div className="text-slate-600 mb-1">Time</div>
                  <div className="font-medium text-slate-900 flex items-center gap-1">
                    <Clock size={14} />
                    {appointmentDetails.time}
                  </div>
                </div>
                <div>
                  <div className="text-slate-600 mb-1">Type</div>
                  <div className="font-medium text-slate-900 capitalize">
                    {appointmentDetails.type}
                  </div>
                </div>
                <div>
                  <div className="text-slate-600 mb-1">Status</div>
                  <div className="font-medium text-slate-900 capitalize">
                    {appointmentDetails.status}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Items Table */}
          <div className="mb-8">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-slate-300">
                  <th className="text-left py-3 text-sm font-semibold text-slate-900 uppercase">
                    Description
                  </th>
                  <th className="text-center py-3 text-sm font-semibold text-slate-900 uppercase">
                    Qty
                  </th>
                  <th className="text-right py-3 text-sm font-semibold text-slate-900 uppercase">
                    Unit Price
                  </th>
                  <th className="text-right py-3 text-sm font-semibold text-slate-900 uppercase">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.items.map((item, index) => (
                  <tr key={index} className="border-b border-slate-200">
                    <td className="py-4 text-sm text-slate-900">
                      <div className="font-medium">{item.description}</div>
                      {item.details && (
                        <div className="text-xs text-slate-600 mt-1">{item.details}</div>
                      )}
                    </td>
                    <td className="py-4 text-sm text-slate-900 text-center">
                      {item.quantity}
                    </td>
                    <td className="py-4 text-sm text-slate-900 text-right">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="py-4 text-sm font-medium text-slate-900 text-right">
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-full md:w-80">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Subtotal:</span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(invoiceData.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">
                    Tax ({invoiceData.taxRate}%):
                  </span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(invoiceData.taxAmount)}
                  </span>
                </div>
                {invoiceData.discount && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Discount:</span>
                    <span className="font-medium text-green-600">
                      -{formatCurrency(invoiceData.discount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-3 border-t-2 border-slate-300">
                  <span className="text-base font-semibold text-slate-900">
                    Total:
                  </span>
                  <span className="text-xl font-bold text-indigo-600">
                    {formatCurrency(invoiceData.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          {invoiceData.status === 'paid' && (
            <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Check size={20} className="text-green-600" />
                <h3 className="text-sm font-semibold text-green-900 uppercase">
                  Payment Received
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                {invoiceData.paymentMethod && (
                  <div>
                    <div className="text-green-700 mb-1">Payment Method</div>
                    <div className="font-medium text-green-900 flex items-center gap-1 capitalize">
                      <CreditCard size={14} />
                      {invoiceData.paymentMethod}
                    </div>
                  </div>
                )}
                {invoiceData.transactionId && (
                  <div>
                    <div className="text-green-700 mb-1">Transaction ID</div>
                    <div className="font-medium text-green-900 font-mono text-xs">
                      {invoiceData.transactionId}
                    </div>
                  </div>
                )}
                {invoiceData.paidDate && (
                  <div>
                    <div className="text-green-700 mb-1">Payment Date</div>
                    <div className="font-medium text-green-900">
                      {formatDate(invoiceData.paidDate)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {invoiceData.notes && (
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-slate-900 uppercase mb-2">
                Notes
              </h3>
              <p className="text-sm text-slate-600">{invoiceData.notes}</p>
            </div>
          )}

          {/* Terms & Conditions */}
          <div className="pt-8 border-t border-slate-200">
            <h3 className="text-sm font-semibold text-slate-900 uppercase mb-2">
              Terms & Conditions
            </h3>
            <div className="text-xs text-slate-600 space-y-1">
              <p>
                Payment is due within 30 days of the invoice date. Late payments may be
                subject to additional fees.
              </p>
              <p>
                For questions regarding this invoice, please contact our billing
                department at {companyInfo.email} or {companyInfo.phone}.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-6 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-500">
              {companyInfo.name} | {companyInfo.website} | Tax ID: {companyInfo.taxId}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Thank you for choosing {companyInfo.name}
            </p>
          </div>
        </div>
      </Card>

      {/* Email Modal */}
      <Modal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        title="Email Invoice"
      >
        {emailSent ? (
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <Check size={32} className="text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Invoice Sent!
            </h3>
            <p className="text-slate-600">
              The invoice has been sent to {emailRecipient}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Send a copy of invoice {invoiceData.invoiceNumber} to the following email
              address:
            </p>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="recipient@example.com"
                value={emailRecipient}
                onChange={(e) => setEmailRecipient(e.target.value)}
                leftIcon={<Mail size={18} />}
              />
            </div>

            <div className="flex items-center gap-3 pt-4">
              <Button
                onClick={handleEmail}
                disabled={emailing || !emailRecipient.trim()}
                className="flex-1"
              >
                {emailing ? (
                  <>
                    <Spinner size="sm" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail size={18} />
                    Send Invoice
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowEmailModal(false)}
                disabled={emailing}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Share Modal */}
      <Modal
        isOpen={showShareModal}
        onClose={() => {
          setShowShareModal(false);
          setLinkCopied(false);
        }}
        title="Share Invoice"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Share this invoice link with others. They will be able to view the
            invoice online.
          </p>

          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Input
                value={shareLink}
                readOnly
                className="flex-1 bg-white"
              />
              <Button
                variant="outline"
                onClick={copyShareLink}
                className="flex items-center gap-2 shrink-0"
              >
                {linkCopied ? (
                  <>
                    <Check size={18} className="text-green-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={18} />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="pt-4">
            <Button variant="outline" onClick={() => setShowShareModal(false)} className="w-full">
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

InvoiceDownload.propTypes = {
  invoiceId: PropTypes.string,
  invoiceData: PropTypes.shape({
    invoiceNumber: PropTypes.string.isRequired,
    invoiceDate: PropTypes.string.isRequired,
    dueDate: PropTypes.string.isRequired,
    status: PropTypes.oneOf(['paid', 'pending', 'overdue', 'cancelled']).isRequired,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        description: PropTypes.string.isRequired,
        details: PropTypes.string,
        quantity: PropTypes.number.isRequired,
        unitPrice: PropTypes.number.isRequired,
        total: PropTypes.number.isRequired,
      })
    ).isRequired,
    subtotal: PropTypes.number.isRequired,
    taxRate: PropTypes.number.isRequired,
    taxAmount: PropTypes.number.isRequired,
    discount: PropTypes.number,
    total: PropTypes.number.isRequired,
    paymentMethod: PropTypes.string,
    transactionId: PropTypes.string,
    paidDate: PropTypes.string,
    notes: PropTypes.string,
  }),
  appointmentDetails: PropTypes.shape({
    date: PropTypes.string,
    time: PropTypes.string,
    type: PropTypes.string,
    status: PropTypes.string,
    amount: PropTypes.number,
    paymentMethod: PropTypes.string,
    transactionId: PropTypes.string,
    isPaid: PropTypes.bool,
    services: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        quantity: PropTypes.number,
        price: PropTypes.number,
      })
    ),
  }),
  patientInfo: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    phone: PropTypes.string,
    address: PropTypes.shape({
      line1: PropTypes.string,
      line2: PropTypes.string,
      city: PropTypes.string,
      state: PropTypes.string,
      postal_code: PropTypes.string,
    }),
  }),
  doctorInfo: PropTypes.shape({
    name: PropTypes.string,
    specialization: PropTypes.string,
    email: PropTypes.string,
    phone: PropTypes.string,
    fees: PropTypes.number,
  }),
  onDownload: PropTypes.func,
  onEmail: PropTypes.func,
  template: PropTypes.oneOf(['default', 'medical', 'receipt']),
  companyInfo: PropTypes.shape({
    name: PropTypes.string,
    address: PropTypes.string,
    city: PropTypes.string,
    phone: PropTypes.string,
    email: PropTypes.string,
    website: PropTypes.string,
    taxId: PropTypes.string,
  }),
  className: PropTypes.string,
};

export default InvoiceDownload;
