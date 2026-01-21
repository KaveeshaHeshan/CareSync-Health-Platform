const Payment = require('../models/Payment');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Notification = require('../models/Notification');
const stripe = require('../config/stripe');

// @desc    Create payment intent for appointment
// @route   POST /api/payments/create-intent
// @access  Private/Patient
exports.createPaymentIntent = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    // Validation
    if (!appointmentId) {
      return res.status(400).json({ message: 'Appointment ID is required' });
    }

    // Get appointment
    const appointment = await Appointment.findById(appointmentId)
      .populate('doctor', 'name fees');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Verify patient
    if (appointment.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if already paid
    if (appointment.isPaid) {
      return res.status(400).json({ message: 'Appointment already paid' });
    }

    // Get amount from appointment or doctor fees
    const amount = appointment.amount || appointment.doctor.fees;

    if (!amount) {
      return res.status(400).json({ message: 'Payment amount not available' });
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        appointmentId: appointment._id.toString(),
        patientId: req.user._id.toString(),
        doctorId: appointment.doctor._id.toString()
      },
      description: `Appointment with Dr. ${appointment.doctor.name}`
    });

    // Create payment record
    const payment = await Payment.create({
      patient: req.user._id,
      doctor: appointment.doctor._id,
      appointment: appointment._id,
      amount,
      paymentMethod: 'card',
      stripePaymentIntentId: paymentIntent.id,
      status: 'pending'
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentId: payment._id,
      amount
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Confirm payment
// @route   POST /api/payments/confirm
// @access  Private/Patient
exports.confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId, paymentId } = req.body;

    // Validation
    if (!paymentIntentId || !paymentId) {
      return res.status(400).json({
        message: 'Payment intent ID and payment ID are required'
      });
    }

    // Get payment record
    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Verify ownership
    if (payment.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Update payment record
      payment.status = 'succeeded';
      payment.transactionId = paymentIntent.id;
      await payment.save();

      // Update appointment
      await Appointment.findByIdAndUpdate(payment.appointment, {
        isPaid: true,
        status: 'confirmed'
      });

      // Create notifications
      await Notification.create({
        user: payment.patient,
        type: 'PAYMENT_SUCCESSFUL',
        title: 'Payment Successful',
        message: `Payment of $${payment.amount} has been processed successfully.`,
        relatedPayment: payment._id,
        priority: 'medium'
      });

      await Notification.create({
        user: payment.doctor,
        type: 'PAYMENT_RECEIVED',
        title: 'Payment Received',
        message: `You have received a payment of $${payment.amount}.`,
        relatedPayment: payment._id,
        priority: 'medium'
      });

      res.json({
        success: true,
        message: 'Payment confirmed successfully',
        payment
      });
    } else {
      payment.status = 'failed';
      await payment.save();

      res.status(400).json({
        success: false,
        message: 'Payment not successful',
        status: paymentIntent.status
      });
    }
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Process refund
// @route   POST /api/payments/:id/refund
// @access  Private/Admin
exports.processRefund = async (req, res) => {
  try {
    const { reason, amount } = req.body;

    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.status !== 'succeeded') {
      return res.status(400).json({
        message: 'Can only refund successful payments'
      });
    }

    if (payment.refundStatus === 'refunded') {
      return res.status(400).json({ message: 'Payment already refunded' });
    }

    // Process Stripe refund
    const refundAmount = amount || payment.amount;
    const refund = await stripe.refunds.create({
      payment_intent: payment.stripePaymentIntentId,
      amount: Math.round(refundAmount * 100), // Convert to cents
      reason: 'requested_by_customer'
    });

    // Update payment record
    payment.status = 'refunded';
    payment.refundStatus = 'refunded';
    payment.refundAmount = refundAmount;
    payment.refundReason = reason;
    payment.refundDate = new Date();
    payment.stripeRefundId = refund.id;
    await payment.save();

    // Update appointment
    await Appointment.findByIdAndUpdate(payment.appointment, {
      isPaid: false,
      status: 'cancelled'
    });

    // Notify patient
    await Notification.create({
      user: payment.patient,
      type: 'REFUND_PROCESSED',
      title: 'Refund Processed',
      message: `A refund of $${refundAmount} has been processed to your account.`,
      relatedPayment: payment._id,
      priority: 'medium'
    });

    // Notify doctor
    await Notification.create({
      user: payment.doctor,
      type: 'REFUND_PROCESSED',
      title: 'Payment Refunded',
      message: `A payment of $${refundAmount} has been refunded.`,
      relatedPayment: payment._id,
      priority: 'medium'
    });

    res.json({
      success: true,
      message: 'Refund processed successfully',
      payment
    });
  } catch (error) {
    console.error('Process refund error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get payment history
// @route   GET /api/payments/history
// @access  Private
exports.getPaymentHistory = async (req, res) => {
  try {
    const {
      status,
      startDate,
      endDate,
      page = 1,
      limit = 20
    } = req.query;

    // Build query based on user role
    const query = {};
    if (req.user.role === 'PATIENT') {
      query.patient = req.user._id;
    } else if (req.user.role === 'DOCTOR') {
      query.doctor = req.user._id;
    }

    if (status) query.status = status;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const payments = await Payment.find(query)
      .populate('patient', 'name email')
      .populate('doctor', 'name specialization')
      .populate('appointment')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments(query);

    // Calculate totals
    const totals = await Payment.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      payments,
      totals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single payment
// @route   GET /api/payments/:id
// @access  Private
exports.getPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name specialization')
      .populate('appointment');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Authorization check
    const isAuthorized =
      payment.patient._id.toString() === req.user._id.toString() ||
      payment.doctor._id.toString() === req.user._id.toString() ||
      req.user.role === 'ADMIN';

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({
      success: true,
      payment
    });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get payment statistics
// @route   GET /api/payments/stats
// @access  Private
exports.getPaymentStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build query based on user role and date filter
    const query = {};
    if (req.user.role === 'DOCTOR') {
      query.doctor = req.user._id;
    } else if (req.user.role === 'PATIENT') {
      query.patient = req.user._id;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const [
      totalStats,
      statusBreakdown,
      monthlyRevenue,
      paymentMethodBreakdown
    ] = await Promise.all([
      // Total statistics
      Payment.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
            count: { $sum: 1 },
            succeeded: {
              $sum: {
                $cond: [{ $eq: ['$status', 'succeeded'] }, '$amount', 0]
              }
            },
            pending: {
              $sum: {
                $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0]
              }
            },
            failed: {
              $sum: {
                $cond: [{ $eq: ['$status', 'failed'] }, '$amount', 0]
              }
            },
            refunded: {
              $sum: {
                $cond: [{ $eq: ['$status', 'refunded'] }, '$refundAmount', 0]
              }
            }
          }
        }
      ]),
      // Status breakdown
      Payment.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            total: { $sum: '$amount' }
          }
        }
      ]),
      // Monthly revenue (last 6 months)
      Payment.aggregate([
        {
          $match: {
            ...query,
            status: 'succeeded',
            createdAt: {
              $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000)
            }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            revenue: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      // Payment method breakdown
      Payment.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$paymentMethod',
            count: { $sum: 1 },
            total: { $sum: '$amount' }
          }
        }
      ])
    ]);

    res.json({
      success: true,
      stats: {
        overview: totalStats[0] || {
          total: 0,
          count: 0,
          succeeded: 0,
          pending: 0,
          failed: 0,
          refunded: 0
        },
        statusBreakdown,
        monthlyRevenue,
        paymentMethodBreakdown
      }
    });
  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Webhook handler for Stripe events
// @route   POST /api/payments/webhook
// @access  Public (Stripe)
exports.webhookHandler = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        
        // Update payment record
        await Payment.findOneAndUpdate(
          { stripePaymentIntentId: paymentIntent.id },
          {
            status: 'succeeded',
            transactionId: paymentIntent.id
          }
        );
        break;

      case 'payment_intent.payment_failed':
        const failedIntent = event.data.object;
        
        await Payment.findOneAndUpdate(
          { stripePaymentIntentId: failedIntent.id },
          { status: 'failed' }
        );
        break;

      case 'charge.refunded':
        const refund = event.data.object;
        
        await Payment.findOneAndUpdate(
          { stripePaymentIntentId: refund.payment_intent },
          {
            status: 'refunded',
            refundStatus: 'refunded',
            refundAmount: refund.amount_refunded / 100,
            refundDate: new Date()
          }
        );
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ message: 'Webhook handler failed' });
  }
};

// @desc    Get doctor earnings
// @route   GET /api/payments/earnings
// @access  Private/Doctor
exports.getDoctorEarnings = async (req, res) => {
  try {
    if (req.user.role !== 'DOCTOR') {
      return res.status(403).json({ message: 'Only doctors can access earnings' });
    }

    const { startDate, endDate } = req.query;

    const query = {
      doctor: req.user._id,
      status: 'succeeded'
    };

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const earnings = await Payment.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: '$amount' },
          totalTransactions: { $sum: 1 }
        }
      }
    ]);

    const monthlyEarnings = await Payment.aggregate([
      {
        $match: {
          doctor: req.user._id,
          status: 'succeeded',
          createdAt: {
            $gte: new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000)
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          earnings: { $sum: '$amount' },
          transactions: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      success: true,
      earnings: earnings[0] || { totalEarnings: 0, totalTransactions: 0 },
      monthlyEarnings
    });
  } catch (error) {
    console.error('Get doctor earnings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};