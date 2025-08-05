const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { findUserByEmail } = require('../db');

const router = express.Router();

// Admin login (email-based)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    // Find user
    const user = findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    // Check password (for demo, we'll use simple comparison)
    // In production, use bcrypt.compare(password, user.password)
    const isValidPassword = password === 'password' || await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role,
        branch_id: user.branch_id
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        branch_id: user.branch_id
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Mobile OTP login
router.post('/otp-login', async (req, res) => {
  try {
    const { phone, otp } = req.body;

    // Validation
    if (!phone || !otp) {
      return res.status(400).json({
        error: 'Phone number and OTP are required'
      });
    }

    // Mock OTP verification (in production, verify with Firebase/SMS service)
    const validOTP = '123456'; // Demo OTP
    
    if (otp !== validOTP) {
      return res.status(401).json({
        error: 'Invalid OTP'
      });
    }

    // Mock member data (in production, find member by phone)
    const mockMember = {
      id: 101,
      name: 'Demo Member',
      phone: phone,
      email: 'member@example.com',
      role: 'member',
      plan: 'Premium',
      branch_id: 1
    };

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: mockMember.id,
        phone: mockMember.phone,
        role: mockMember.role,
        branch_id: mockMember.branch_id
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      message: 'OTP verification successful',
      token,
      member: mockMember
    });

  } catch (error) {
    console.error('OTP login error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Send OTP (mock endpoint)
router.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        error: 'Phone number is required'
      });
    }

    // Mock OTP sending (in production, integrate with Firebase/SMS service)
    const otp = '123456'; // Demo OTP
    
    // Simulate API delay
    setTimeout(() => {
      res.json({
        success: true,
        message: 'OTP sent successfully',
        // Don't send OTP in production response
        otp: process.env.NODE_ENV === 'development' ? otp : undefined
      });
    }, 1000);

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Verify token endpoint
router.get('/verify', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        error: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    res.json({
      success: true,
      valid: true,
      user: decoded
    });

  } catch (error) {
    res.status(401).json({
      success: false,
      valid: false,
      error: 'Invalid token'
    });
  }
});

module.exports = router;
