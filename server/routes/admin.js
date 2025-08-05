const express = require('express');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');
const { getDummyData } = require('../db');

const router = express.Router();

// Apply authentication middleware to all admin routes
router.use(authMiddleware);

// Dashboard KPIs
router.get('/dashboard', requireRole(['owner', 'manager']), async (req, res) => {
  try {
    const members = getDummyData('members');
    const trainers = getDummyData('trainers');
    const branches = getDummyData('branches');
    const classes = getDummyData('classes');

    // Calculate KPIs
    const activeMembers = members.filter(m => m.status === 'active').length;
    const totalMembers = members.length;
    const totalTrainers = trainers.length;
    const totalBranches = branches.length;
    
    // Mock revenue calculation
    const monthlyRevenue = activeMembers * 2500; // Average plan cost
    const dailyRevenue = monthlyRevenue / 30;

    // Mock attendance trends (last 7 days)
    const attendanceTrends = [
      { date: '2024-01-15', attendance: 85 },
      { date: '2024-01-16', attendance: 92 },
      { date: '2024-01-17', attendance: 78 },
      { date: '2024-01-18', attendance: 88 },
      { date: '2024-01-19', attendance: 95 },
      { date: '2024-01-20', attendance: 82 },
      { date: '2024-01-21', attendance: 90 }
    ];

    // Mock trainer earnings
    const trainerEarnings = trainers.map(trainer => ({
      id: trainer.id,
      name: trainer.name,
      earnings: trainer.active_members * 500, // Commission per member
      sessions: trainer.active_members * 4, // Sessions per month
      rating: trainer.rating
    }));

    res.json({
      success: true,
      data: {
        kpis: {
          activeMembers,
          totalMembers,
          totalTrainers,
          totalBranches,
          monthlyRevenue,
          dailyRevenue,
          averageRating: 4.7
        },
        charts: {
          attendanceTrends,
          trainerEarnings
        },
        recentActivity: [
          { type: 'member_joined', message: 'Rahul Sharma joined Premium plan', time: '2 hours ago' },
          { type: 'payment_received', message: 'Payment received from Priya Patel', time: '4 hours ago' },
          { type: 'class_booked', message: 'Morning Yoga class fully booked', time: '6 hours ago' }
        ]
      }
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      error: 'Failed to fetch dashboard data'
    });
  }
});

// Member Management
router.get('/members', requireRole(['owner', 'manager', 'trainer']), async (req, res) => {
  try {
    const { status, trainer_id, branch_id, search } = req.query;
    let members = getDummyData('members');
    const trainers = getDummyData('trainers');

    // Apply filters
    if (status) {
      members = members.filter(m => m.status === status);
    }
    if (trainer_id) {
      members = members.filter(m => m.trainer_id === parseInt(trainer_id));
    }
    if (branch_id) {
      members = members.filter(m => m.branch_id === parseInt(branch_id));
    }
    if (search) {
      members = members.filter(m => 
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Add trainer info to members
    const membersWithTrainers = members.map(member => ({
      ...member,
      trainer: trainers.find(t => t.id === member.trainer_id)
    }));

    res.json({
      success: true,
      data: {
        members: membersWithTrainers,
        total: membersWithTrainers.length,
        filters: {
          statuses: ['active', 'inactive', 'expired'],
          trainers: trainers.map(t => ({ id: t.id, name: t.name }))
        }
      }
    });

  } catch (error) {
    console.error('Members fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch members'
    });
  }
});

// Assign trainer to member
router.post('/members/:id/assign-trainer', requireRole(['owner', 'manager']), async (req, res) => {
  try {
    const { id } = req.params;
    const { trainer_id } = req.body;

    if (!trainer_id) {
      return res.status(400).json({
        error: 'Trainer ID is required'
      });
    }

    // In a real app, update database
    // For demo, just return success
    res.json({
      success: true,
      message: 'Trainer assigned successfully',
      data: {
        member_id: parseInt(id),
        trainer_id: parseInt(trainer_id),
        assigned_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Assign trainer error:', error);
    res.status(500).json({
      error: 'Failed to assign trainer'
    });
  }
});

// Extend member plan
router.post('/members/:id/extend-plan', requireRole(['owner', 'manager']), async (req, res) => {
  try {
    const { id } = req.params;
    const { months, plan_type } = req.body;

    if (!months) {
      return res.status(400).json({
        error: 'Extension period is required'
      });
    }

    // Calculate new expiry date
    const currentDate = new Date();
    const newExpiryDate = new Date(currentDate.setMonth(currentDate.getMonth() + parseInt(months)));

    res.json({
      success: true,
      message: 'Plan extended successfully',
      data: {
        member_id: parseInt(id),
        extended_months: parseInt(months),
        new_expiry_date: newExpiryDate.toISOString().split('T')[0],
        plan_type: plan_type || 'Premium'
      }
    });

  } catch (error) {
    console.error('Extend plan error:', error);
    res.status(500).json({
      error: 'Failed to extend plan'
    });
  }
});

// Trainer Management
router.get('/trainers', requireRole(['owner', 'manager']), async (req, res) => {
  try {
    const trainers = getDummyData('trainers');
    const members = getDummyData('members');

    // Add workload info to trainers
    const trainersWithWorkload = trainers.map(trainer => {
      const assignedMembers = members.filter(m => m.trainer_id === trainer.id && m.status === 'active');
      return {
        ...trainer,
        current_workload: assignedMembers.length,
        workload_percentage: (assignedMembers.length / 20) * 100, // Assuming max 20 members per trainer
        recent_sessions: Math.floor(Math.random() * 50) + 20, // Mock session count
        feedback_score: trainer.rating
      };
    });

    res.json({
      success: true,
      data: {
        trainers: trainersWithWorkload,
        total: trainersWithWorkload.length
      }
    });

  } catch (error) {
    console.error('Trainers fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch trainers'
    });
  }
});

// Class Management
router.get('/classes', requireRole(['owner', 'manager', 'trainer']), async (req, res) => {
  try {
    const classes = getDummyData('classes');
    const trainers = getDummyData('trainers');

    // Add trainer info to classes
    const classesWithTrainers = classes.map(cls => ({
      ...cls,
      trainer: trainers.find(t => t.id === cls.trainer_id),
      availability: cls.capacity - cls.booked,
      booking_percentage: (cls.booked / cls.capacity) * 100
    }));

    res.json({
      success: true,
      data: {
        classes: classesWithTrainers,
        total: classesWithTrainers.length
      }
    });

  } catch (error) {
    console.error('Classes fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch classes'
    });
  }
});

// Create new class
router.post('/classes', requireRole(['owner', 'manager']), async (req, res) => {
  try {
    const { name, trainer_id, branch_id, schedule, capacity, duration } = req.body;

    if (!name || !trainer_id || !schedule || !capacity) {
      return res.status(400).json({
        error: 'Name, trainer, schedule, and capacity are required'
      });
    }

    const newClass = {
      id: Date.now(), // Mock ID
      name,
      trainer_id: parseInt(trainer_id),
      branch_id: parseInt(branch_id) || req.user.branch_id,
      schedule,
      capacity: parseInt(capacity),
      booked: 0,
      duration: parseInt(duration) || 60,
      created_at: new Date().toISOString()
    };

    res.json({
      success: true,
      message: 'Class created successfully',
      data: newClass
    });

  } catch (error) {
    console.error('Create class error:', error);
    res.status(500).json({
      error: 'Failed to create class'
    });
  }
});

// Lead Management
router.get('/leads', requireRole(['owner', 'manager']), async (req, res) => {
  try {
    const { status, branch_id } = req.query;
    let leads = getDummyData('leads');

    // Apply filters
    if (status) {
      leads = leads.filter(l => l.status === status);
    }
    if (branch_id) {
      leads = leads.filter(l => l.branch_id === parseInt(branch_id));
    }

    // Group leads by status for pipeline view
    const pipeline = {
      new: leads.filter(l => l.status === 'new'),
      warm: leads.filter(l => l.status === 'warm'),
      converted: leads.filter(l => l.status === 'converted')
    };

    res.json({
      success: true,
      data: {
        leads,
        pipeline,
        total: leads.length,
        conversion_rate: pipeline.converted.length / leads.length * 100
      }
    });

  } catch (error) {
    console.error('Leads fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch leads'
    });
  }
});

// Store Management
router.get('/store/products', requireRole(['owner', 'manager']), async (req, res) => {
  try {
    const { category, visible } = req.query;
    let products = getDummyData('products');

    // Apply filters
    if (category) {
      products = products.filter(p => p.category === category);
    }
    if (visible !== undefined) {
      products = products.filter(p => p.visible === (visible === 'true'));
    }

    // Mock sales data
    const salesData = products.map(product => ({
      ...product,
      sales_this_month: Math.floor(Math.random() * 50) + 10,
      revenue_this_month: (Math.floor(Math.random() * 50) + 10) * product.price
    }));

    res.json({
      success: true,
      data: {
        products: salesData,
        total: salesData.length,
        categories: ['Supplements', 'Apparel', 'Equipment', 'Accessories']
      }
    });

  } catch (error) {
    console.error('Products fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch products'
    });
  }
});

// Analytics & Reports
router.get('/reports/feedback', requireRole(['owner', 'manager']), async (req, res) => {
  try {
    const trainers = getDummyData('trainers');

    // Mock feedback data
    const feedbackData = trainers.map(trainer => ({
      trainer_id: trainer.id,
      trainer_name: trainer.name,
      average_rating: trainer.rating,
      total_feedback: Math.floor(Math.random() * 100) + 20,
      recent_feedback: [
        { rating: 5, comment: 'Excellent trainer, very motivating!', date: '2024-01-20' },
        { rating: 4, comment: 'Good workout sessions', date: '2024-01-19' },
        { rating: 5, comment: 'Professional and knowledgeable', date: '2024-01-18' }
      ]
    }));

    // Mock session feedback trends
    const feedbackTrends = [
      { date: '2024-01-15', average_rating: 4.5 },
      { date: '2024-01-16', average_rating: 4.7 },
      { date: '2024-01-17', average_rating: 4.6 },
      { date: '2024-01-18', average_rating: 4.8 },
      { date: '2024-01-19', average_rating: 4.7 },
      { date: '2024-01-20', average_rating: 4.9 },
      { date: '2024-01-21', average_rating: 4.8 }
    ];

    res.json({
      success: true,
      data: {
        trainer_feedback: feedbackData,
        feedback_trends: feedbackTrends,
        overall_rating: 4.7,
        total_feedback_count: feedbackData.reduce((sum, t) => sum + t.total_feedback, 0)
      }
    });

  } catch (error) {
    console.error('Feedback reports error:', error);
    res.status(500).json({
      error: 'Failed to fetch feedback reports'
    });
  }
});

module.exports = router;
