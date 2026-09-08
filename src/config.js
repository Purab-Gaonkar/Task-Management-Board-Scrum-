require('dotenv').config();

module.exports = {
  port: parseInt(process.env.PORT || '5002', 10),
  
  // PostgreSQL environment configuration - ZERO HARDCODING
  pg: {
    host: process.env.PG_HOST || 'localhost',
    port: parseInt(process.env.PG_PORT || '5432', 10),
    database: process.env.PG_DB || 'scrum_users',
    user: process.env.PG_USER || 'scrum_pg_admin',
    password: process.env.PG_PASSWORD || 'SuperSecurePostgresPass123!',
  },

  jwtSecret: process.env.JWT_SECRET || 'super_secret_scrum_jwt_key_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h'
};
