const { Pool } = require('pg');

// Database connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'koredio_gym',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
pool.on('connect', () => {
  console.log('📊 Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
});

// Dummy data for MVP
const dummyData = {
  users: [
    {
      id: 1,
      email: 'admin@koredio.com',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      role: 'owner',
      name: 'Admin User',
      branch_id: 1
    },
    {
      id: 2,
      email: 'manager@koredio.com',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      role: 'manager',
      name: 'Manager User',
      branch_id: 1
    }
  ],
  members: [
    {
      id: 1,
      name: 'Rahul Sharma',
      email: 'rahul@example.com',
      phone: '+91-9876543210',
      status: 'active',
      plan: 'Premium',
      trainer_id: 1,
      branch_id: 1,
      join_date: '2024-01-15',
      plan_expiry: '2024-07-15'
    },
    {
      id: 2,
      name: 'Priya Patel',
      email: 'priya@example.com',
      phone: '+91-9876543211',
      status: 'active',
      plan: 'Basic',
      trainer_id: 2,
      branch_id: 1,
      join_date: '2024-02-01',
      plan_expiry: '2024-08-01'
    },
    {
      id: 3,
      name: 'Amit Kumar',
      email: 'amit@example.com',
      phone: '+91-9876543212',
      status: 'expired',
      plan: 'Premium',
      trainer_id: 1,
      branch_id: 2,
      join_date: '2023-12-01',
      plan_expiry: '2024-06-01'
    }
  ],
  trainers: [
    {
      id: 1,
      name: 'Vikash Singh',
      email: 'vikash@koredio.com',
      phone: '+91-9876543220',
      specialization: 'Weight Training',
      experience: '5 years',
      rating: 4.8,
      active_members: 15,
      branch_id: 1
    },
    {
      id: 2,
      name: 'Sneha Reddy',
      email: 'sneha@koredio.com',
      phone: '+91-9876543221',
      specialization: 'Yoga & Cardio',
      experience: '3 years',
      rating: 4.6,
      active_members: 12,
      branch_id: 1
    }
  ],
  branches: [
    {
      id: 1,
      name: 'Koredio Bandra',
      address: 'Shop 101, Linking Road, Bandra West, Mumbai - 400050',
      phone: '+91-22-26431234',
      manager_id: 2,
      active_members: 150,
      total_capacity: 200
    },
    {
      id: 2,
      name: 'Koredio Andheri',
      address: 'Unit 205, Infinity Mall, Andheri West, Mumbai - 400053',
      phone: '+91-22-26431235',
      manager_id: 2,
      active_members: 120,
      total_capacity: 180
    }
  ],
  classes: [
    {
      id: 1,
      name: 'Morning Yoga',
      trainer_id: 2,
      branch_id: 1,
      schedule: 'Mon, Wed, Fri - 7:00 AM',
      capacity: 20,
      booked: 12,
      duration: 60
    },
    {
      id: 2,
      name: 'HIIT Training',
      trainer_id: 1,
      branch_id: 1,
      schedule: 'Tue, Thu, Sat - 6:00 PM',
      capacity: 15,
      booked: 8,
      duration: 45
    }
  ],
  leads: [
    {
      id: 1,
      name: 'Rohit Mehta',
      phone: '+91-9876543230',
      email: 'rohit@example.com',
      status: 'new',
      source: 'Website',
      branch_id: 1,
      created_at: '2024-01-20'
    },
    {
      id: 2,
      name: 'Kavya Nair',
      phone: '+91-9876543231',
      email: 'kavya@example.com',
      status: 'warm',
      source: 'Referral',
      branch_id: 1,
      created_at: '2024-01-18'
    }
  ],
  products: [
    {
      id: 1,
      name: 'Protein Powder',
      price: 2500,
      stock: 50,
      category: 'Supplements',
      visible: true,
      branch_id: 1
    },
    {
      id: 2,
      name: 'Gym T-Shirt',
      price: 800,
      stock: 25,
      category: 'Apparel',
      visible: true,
      branch_id: 1
    }
  ]
};

// Database query functions
const query = async (text, params) => {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Dummy query functions for MVP
const getDummyData = (table) => {
  return dummyData[table] || [];
};

const findUserByEmail = (email) => {
  return dummyData.users.find(user => user.email === email);
};

const findUserById = (id) => {
  return dummyData.users.find(user => user.id === parseInt(id));
};

module.exports = {
  query,
  pool,
  dummyData,
  getDummyData,
  findUserByEmail,
  findUserById
};
