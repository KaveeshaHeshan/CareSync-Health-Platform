const stripe = require('../config/stripe');
const Appointment = require('../models/Appointment');

/**
 * CREATE CHECKOUT SESSION
 * POST /api/payments/create-checkout
 * Secure: Requires Auth
 */
exports.createCheckoutSession = async (req, res) => {
  const { appointmentId } = req.body;

  try {
    // 1. Fetch appointment details from DB
    const appointment = await Appointment.findById(appointmentId).populate('doctor');
    
    if (!appointment) {
      return res.status(404).json({ msg: 'Appointment not found' });
    }

    // 2. Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      // Metadata allows us to track which appointment this payment is for
      metadata: {
        appointmentId: appointmentId.toString(),
        patientId: req.user.id
      },
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Consultation with Dr. ${appointment.doctor.name}`,
              description: `Appointment scheduled for ${new Date(appointment.date).toLocaleDateString()}`,
            },
            unit_amount: 5000, // Amount in cents ($50.00)
          },
          quantity: 1,
        },
      ],
      // Redirect URLs after payment attempt
      success_url: `${process.env.CLIENT_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/billing/cancel`,
    });

    res.json({ id: session.id, url: session.url });
  } catch (err) {
    console.error('Stripe Session Error:', err.message);
    res.status(500).json({ error: 'Failed to create payment session' });
  }
};

/**
 * VERIFY PAYMENT STATUS
 * GET /api/payments/verify/:sessionId
 */
exports.verifyPayment = async (req, res) => {
  const { sessionId } = req.params;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      // Update appointment status in database
      const appointmentId = session.metadata.appointmentId;
      await Appointment.findByIdAndUpdate(appointmentId, {
        paymentStatus: 'paid',
        status: 'scheduled' 
      });

      return res.json({ success: true, msg: 'Payment verified and appointment confirmed' });
    }

    res.status(400).json({ success: false, msg: 'Payment not completed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};