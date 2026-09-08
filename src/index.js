const express = require('express');
const cors = require('cors');
const config = require('./config');
const { pool } = require('./db');
const { initUserModel } = require('./models/user');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const dbRes = await pool.query('SELECT NOW()');
    return res.status(200).json({
      service: 'user-service',
      status: 'HEALTHY',
      database: 'CONNECTED',
      db_time: dbRes.rows[0].now,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return res.status(500).json({
      service: 'user-service',
      status: 'UNHEALTHY',
      database_error: err.message
    });
  }
});

app.get('/', (req, res) => {
  res.status(200).json({
    service: 'Scrum Board User Service',
    language: 'Node.js 20 (Express)',
    database: 'PostgreSQL 16',
    status: 'RUNNING'
  });
});

// Register API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Initialize DB schema then start server
initUserModel().then(() => {
  app.listen(config.port, '0.0.0.0', () => {
    console.log(`User Service running on port ${config.port}`);
  });
}).catch((err) => {
  console.error('Failed to initialize User Service database:', err);
  process.exit(1);
});
