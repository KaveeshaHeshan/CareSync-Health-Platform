import axiosInstance from './axiosInstance';

const paymentApi = {
  // ========== Payment Processing ==========
  
  // Create payment intent (Stripe)
  createPaymentIntent: async (paymentData) => {
    const response = await axiosInstance.post('/payments/create-intent', paymentData);
    return response.data;
  },

  // Process payment
  processPayment: async (paymentData) => {
    const response = await axiosInstance.post('/payments/process', paymentData);
    return response.data;
  },

  // Confirm payment
  confirmPayment: async (paymentId) => {
    const response = await axiosInstance.post(`/payments/${paymentId}/confirm`);
    return response.data;
  },

  // Pay for appointment
  payForAppointment: async (appointmentId, paymentData) => {
    const response = await axiosInstance.post(`/payments/appointments/${appointmentId}`, paymentData);
    return response.data;
  },

  // ========== Payment Methods ==========
  
  // Add payment method
  addPaymentMethod: async (methodData) => {
    const response = await axiosInstance.post('/payments/methods', methodData);
    return response.data;
  },

  // Get payment methods
  getPaymentMethods: async () => {
    const response = await axiosInstance.get('/payments/methods');
    return response.data;
  },

  // Update payment method
  updatePaymentMethod: async (methodId, methodData) => {
    const response = await axiosInstance.put(`/payments/methods/${methodId}`, methodData);
    return response.data;
  },

  // Delete payment method
  deletePaymentMethod: async (methodId) => {
    const response = await axiosInstance.delete(`/payments/methods/${methodId}`);
    return response.data;
  },

  // Set default payment method
  setDefaultPaymentMethod: async (methodId) => {
    const response = await axiosInstance.patch(`/payments/methods/${methodId}/default`);
    return response.data;
  },

  // ========== Payment History ==========
  
  // Get all payments
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await axiosInstance.get(`/payments${params ? `?${params}` : ''}`);
    return response.data;
  },

  // Get payment by ID
  getById: async (paymentId) => {
    const response = await axiosInstance.get(`/payments/${paymentId}`);
    return response.data;
  },

  // Get my payment history
  getMyPayments: async () => {
    const response = await axiosInstance.get('/payments/my-payments');
    return response.data;
  },

  // Get payment history by date range
  getPaymentsByDateRange: async (startDate, endDate) => {
    const response = await axiosInstance.get('/payments/history', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  // ========== Invoices ==========
  
  // Get all invoices
  getAllInvoices: async () => {
    const response = await axiosInstance.get('/payments/invoices');
    return response.data;
  },

  // Get invoice by ID
  getInvoiceById: async (invoiceId) => {
    const response = await axiosInstance.get(`/payments/invoices/${invoiceId}`);
    return response.data;
  },

  // Generate invoice
  generateInvoice: async (invoiceData) => {
    const response = await axiosInstance.post('/payments/invoices/generate', invoiceData);
    return response.data;
  },

  // Download invoice (PDF)
  downloadInvoice: async (invoiceId) => {
    const response = await axiosInstance.get(`/payments/invoices/${invoiceId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Email invoice
  emailInvoice: async (invoiceId, email) => {
    const response = await axiosInstance.post(`/payments/invoices/${invoiceId}/email`, { email });
    return response.data;
  },

  // Get invoice for appointment
  getAppointmentInvoice: async (appointmentId) => {
    const response = await axiosInstance.get(`/payments/appointments/${appointmentId}/invoice`);
    return response.data;
  },

  // ========== Refunds ==========
  
  // Request refund
  requestRefund: async (paymentId, refundData) => {
    const response = await axiosInstance.post(`/payments/${paymentId}/refund`, refundData);
    return response.data;
  },

  // Get refund status
  getRefundStatus: async (refundId) => {
    const response = await axiosInstance.get(`/payments/refunds/${refundId}`);
    return response.data;
  },

  // Get all refunds
  getAllRefunds: async () => {
    const response = await axiosInstance.get('/payments/refunds');
    return response.data;
  },

  // Cancel refund request
  cancelRefund: async (refundId) => {
    const response = await axiosInstance.delete(`/payments/refunds/${refundId}`);
    return response.data;
  },

  // ========== Billing ==========
  
  // Get billing summary
  getBillingSummary: async () => {
    const response = await axiosInstance.get('/payments/billing/summary');
    return response.data;
  },

  // Get outstanding balance
  getOutstandingBalance: async () => {
    const response = await axiosInstance.get('/payments/billing/balance');
    return response.data;
  },

  // Get billing history
  getBillingHistory: async (period = 'month') => {
    const response = await axiosInstance.get('/payments/billing/history', {
      params: { period }
    });
    return response.data;
  },

  // Pay outstanding balance
  payOutstandingBalance: async (paymentData) => {
    const response = await axiosInstance.post('/payments/billing/pay-balance', paymentData);
    return response.data;
  },

  // ========== Subscriptions (if applicable) ==========
  
  // Create subscription
  createSubscription: async (subscriptionData) => {
    const response = await axiosInstance.post('/payments/subscriptions', subscriptionData);
    return response.data;
  },

  // Get subscription details
  getSubscription: async () => {
    const response = await axiosInstance.get('/payments/subscriptions/current');
    return response.data;
  },

  // Update subscription
  updateSubscription: async (subscriptionData) => {
    const response = await axiosInstance.put('/payments/subscriptions', subscriptionData);
    return response.data;
  },

  // Cancel subscription
  cancelSubscription: async (reason) => {
    const response = await axiosInstance.delete('/payments/subscriptions', {
      data: { reason }
    });
    return response.data;
  },

  // Get subscription history
  getSubscriptionHistory: async () => {
    const response = await axiosInstance.get('/payments/subscriptions/history');
    return response.data;
  },

  // ========== Payment Statistics ==========
  
  // Get payment statistics
  getPaymentStats: async (period = 'month') => {
    const response = await axiosInstance.get('/payments/stats', {
      params: { period }
    });
    return response.data;
  },

  // Get revenue analytics
  getRevenueAnalytics: async (startDate, endDate) => {
    const response = await axiosInstance.get('/payments/analytics/revenue', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  // ========== Stripe Specific ==========
  
  // Get Stripe publishable key
  getStripePublishableKey: async () => {
    const response = await axiosInstance.get('/payments/stripe/config');
    return response.data;
  },

  // Create Stripe checkout session
  createCheckoutSession: async (sessionData) => {
    const response = await axiosInstance.post('/payments/stripe/checkout', sessionData);
    return response.data;
  },

  // Verify Stripe webhook
  verifyWebhook: async (webhookData) => {
    const response = await axiosInstance.post('/payments/stripe/webhook', webhookData);
    return response.data;
  },

  // ========== Receipts ==========
  
  // Get receipt
  getReceipt: async (paymentId) => {
    const response = await axiosInstance.get(`/payments/${paymentId}/receipt`);
    return response.data;
  },

  // Download receipt
  downloadReceipt: async (paymentId) => {
    const response = await axiosInstance.get(`/payments/${paymentId}/receipt/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Email receipt
  emailReceipt: async (paymentId, email) => {
    const response = await axiosInstance.post(`/payments/${paymentId}/receipt/email`, { email });
    return response.data;
  },

  // ========== Payment Verification ==========
  
  // Verify payment status
  verifyPaymentStatus: async (paymentId) => {
    const response = await axiosInstance.get(`/payments/${paymentId}/verify`);
    return response.data;
  },

  // Check payment eligibility
  checkEligibility: async (appointmentId) => {
    const response = await axiosInstance.get(`/payments/eligibility/${appointmentId}`);
    return response.data;
  },

  // Calculate payment amount
  calculateAmount: async (calculationData) => {
    const response = await axiosInstance.post('/payments/calculate', calculationData);
    return response.data;
  },
};

export default paymentApi;
