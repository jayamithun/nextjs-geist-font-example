const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./routes/auth');
const integrationRoutes = require('./routes/integrations');
const adminRoutes = require('./routes/admin');

app.use('/api/auth', authRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/admin', adminRoutes);

// Swagger documentation (optional)
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Koredio Gym Management API',
    version: '1.0.0',
    description: 'API for Koredio gym management system'
  },
  servers: [
    {
      url: `http://localhost:${PORT}`,
      description: 'Development server'
    }
  ]
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Koredio API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Koredio API server running on port ${PORT}`);
  console.log(`📚 API Documentation available at http://localhost:${PORT}/api-docs`);
});
