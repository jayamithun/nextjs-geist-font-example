const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// AI Plan Generator (Mock OpenAI endpoint)
router.get('/ai-plan', authMiddleware, async (req, res) => {
  try {
    const { type = 'workout', goal = 'fitness', level = 'beginner' } = req.query;

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const mockPlans = {
      workout: {
        beginner: {
          title: 'Beginner Full Body Workout',
          duration: '4 weeks',
          frequency: '3 days per week',
          exercises: [
            {
              day: 'Day 1 - Upper Body',
              exercises: [
                { name: 'Push-ups', sets: 3, reps: '8-12', rest: '60s' },
                { name: 'Dumbbell Rows', sets: 3, reps: '10-15', rest: '60s' },
                { name: 'Shoulder Press', sets: 3, reps: '8-12', rest: '60s' },
                { name: 'Bicep Curls', sets: 2, reps: '12-15', rest: '45s' }
              ]
            },
            {
              day: 'Day 2 - Lower Body',
              exercises: [
                { name: 'Squats', sets: 3, reps: '12-15', rest: '60s' },
                { name: 'Lunges', sets: 3, reps: '10 each leg', rest: '60s' },
                { name: 'Calf Raises', sets: 3, reps: '15-20', rest: '45s' },
                { name: 'Glute Bridges', sets: 3, reps: '12-15', rest: '45s' }
              ]
            },
            {
              day: 'Day 3 - Full Body',
              exercises: [
                { name: 'Burpees', sets: 3, reps: '5-8', rest: '90s' },
                { name: 'Mountain Climbers', sets: 3, reps: '20', rest: '60s' },
                { name: 'Plank', sets: 3, reps: '30-45s', rest: '60s' },
                { name: 'Jumping Jacks', sets: 3, reps: '30', rest: '45s' }
              ]
            }
          ]
        }
      },
      diet: {
        beginner: {
          title: 'Balanced Nutrition Plan',
          duration: '4 weeks',
          calories: '2000-2200 per day',
          meals: [
            {
              meal: 'Breakfast',
              time: '7:00 AM',
              items: [
                'Oatmeal with fruits and nuts',
                'Greek yogurt',
                'Green tea'
              ],
              calories: 400
            },
            {
              meal: 'Mid-Morning Snack',
              time: '10:00 AM',
              items: [
                'Apple with almonds',
                'Water'
              ],
              calories: 200
            },
            {
              meal: 'Lunch',
              time: '1:00 PM',
              items: [
                'Grilled chicken breast',
                'Brown rice',
                'Mixed vegetables',
                'Salad'
              ],
              calories: 600
            },
            {
              meal: 'Evening Snack',
              time: '4:00 PM',
              items: [
                'Protein shake',
                'Banana'
              ],
              calories: 300
            },
            {
              meal: 'Dinner',
              time: '7:00 PM',
              items: [
                'Fish curry',
                'Quinoa',
                'Steamed broccoli'
              ],
              calories: 500
            }
          ]
        }
      }
    };

    const plan = mockPlans[type]?.[level] || mockPlans.workout.beginner;

    res.json({
      success: true,
      message: 'AI plan generated successfully',
      plan: {
        ...plan,
        generated_at: new Date().toISOString(),
        user_id: req.user.id,
        type,
        goal,
        level
      }
    });

  } catch (error) {
    console.error('AI plan generation error:', error);
    res.status(500).json({
      error: 'Failed to generate AI plan'
    });
  }
});

// WhatsApp Business API (Mock endpoint)
router.post('/whatsapp', authMiddleware, async (req, res) => {
  try {
    const { phone, template, variables = {} } = req.body;

    if (!phone || !template) {
      return res.status(400).json({
        error: 'Phone number and template are required'
      });
    }

    // Mock WhatsApp templates
    const templates = {
      welcome: `Hi ${variables.name || 'there'}! Welcome to Koredio Gym. Your membership is now active. Visit us at ${variables.branch || 'our branch'} to start your fitness journey!`,
      reminder: `Hi ${variables.name || 'there'}! This is a friendly reminder about your upcoming class "${variables.class || 'workout session'}" at ${variables.time || 'scheduled time'}. See you there!`,
      payment_due: `Hi ${variables.name || 'there'}! Your membership payment of ₹${variables.amount || 'XXX'} is due on ${variables.due_date || 'soon'}. Please renew to continue enjoying our services.`,
      plan_expiry: `Hi ${variables.name || 'there'}! Your ${variables.plan || 'membership'} plan expires on ${variables.expiry_date || 'soon'}. Renew now to avoid interruption in services.`
    };

    const message = templates[template] || `Hi! This is a message from Koredio Gym.`;

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    res.json({
      success: true,
      message: 'WhatsApp message sent successfully',
      data: {
        phone,
        template,
        message,
        sent_at: new Date().toISOString(),
        message_id: `wa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
    });

  } catch (error) {
    console.error('WhatsApp send error:', error);
    res.status(500).json({
      error: 'Failed to send WhatsApp message'
    });
  }
});

// Razorpay Payment (Mock endpoint)
router.post('/razorpay', authMiddleware, async (req, res) => {
  try {
    const { amount, currency = 'INR', description, customer } = req.body;

    if (!amount || !customer) {
      return res.status(400).json({
        error: 'Amount and customer details are required'
      });
    }

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock payment success (90% success rate)
    const isSuccess = Math.random() > 0.1;

    if (isSuccess) {
      res.json({
        success: true,
        message: 'Payment processed successfully',
        payment: {
          id: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          amount: amount,
          currency: currency,
          status: 'captured',
          description: description,
          customer: customer,
          created_at: new Date().toISOString(),
          method: 'upi',
          upi_id: 'customer@paytm'
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Payment failed',
        reason: 'Insufficient funds or network error'
      });
    }

  } catch (error) {
    console.error('Razorpay payment error:', error);
    res.status(500).json({
      error: 'Payment processing failed'
    });
  }
});

// Firebase Push Notification (Mock endpoint)
router.post('/firebase/push', authMiddleware, async (req, res) => {
  try {
    const { token, title, body, data = {} } = req.body;

    if (!token || !title || !body) {
      return res.status(400).json({
        error: 'Token, title, and body are required'
      });
    }

    // Simulate push notification delay
    await new Promise(resolve => setTimeout(resolve, 500));

    res.json({
      success: true,
      message: 'Push notification sent successfully',
      notification: {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        token,
        title,
        body,
        data,
        sent_at: new Date().toISOString(),
        status: 'delivered'
      }
    });

  } catch (error) {
    console.error('Firebase push notification error:', error);
    res.status(500).json({
      error: 'Failed to send push notification'
    });
  }
});

// Firebase OTP (Mock endpoint)
router.get('/firebase/otp', async (req, res) => {
  try {
    const { phone } = req.query;

    if (!phone) {
      return res.status(400).json({
        error: 'Phone number is required'
      });
    }

    // Simulate OTP generation delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    res.json({
      success: true,
      message: 'OTP generated successfully',
      data: {
        phone,
        otp: process.env.NODE_ENV === 'development' ? otp : undefined,
        expires_in: 300, // 5 minutes
        generated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Firebase OTP error:', error);
    res.status(500).json({
      error: 'Failed to generate OTP'
    });
  }
});

module.exports = router;
