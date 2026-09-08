const db = require('../db');

const initUserModel = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(20) DEFAULT 'Developer',
      avatar_url VARCHAR(255),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  try {
    await db.query(createTableQuery);
    console.log('PostgreSQL "users" table initialized or verified successfully.');
    
    // Seed default admin user if table is empty
    const checkUsers = await db.query('SELECT COUNT(*) FROM users');
    if (parseInt(checkUsers.rows[0].count, 10) === 0) {
      const bcrypt = require('bcryptjs');
      const defaultHash = await bcrypt.hash('admin123', 10);
      await db.query(
        `INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4)`,
        ['admin', 'admin@scrumboard.local', defaultHash, 'Scrum Master']
      );
      const devHash = await bcrypt.hash('dev123', 10);
      await db.query(
        `INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4)`,
        ['john_dev', 'john@scrumboard.local', devHash, 'Developer']
      );
      console.log('Seeded default initial users into PostgreSQL.');
    }
  } catch (err) {
    console.error('Error initializing PostgreSQL users table:', err.message);
  }
};

const createUser = async ({ username, email, password_hash, role, avatar_url }) => {
  const query = `
    INSERT INTO users (username, email, password_hash, role, avatar_url)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, username, email, role, avatar_url, created_at;
  `;
  const values = [username, email, password_hash, role || 'Developer', avatar_url || null];
  const res = await db.query(query, values);
  return res.rows[0];
};

const findUserByEmail = async (email) => {
  const query = `SELECT * FROM users WHERE email = $1;`;
  const res = await db.query(query, [email]);
  return res.rows[0];
};

const findUserByUsername = async (username) => {
  const query = `SELECT * FROM users WHERE username = $1;`;
  const res = await db.query(query, [username]);
  return res.rows[0];
};

const findUserById = async (id) => {
  const query = `SELECT id, username, email, role, avatar_url, created_at FROM users WHERE id = $1;`;
  const res = await db.query(query, [id]);
  return res.rows[0];
};

const getAllUsers = async () => {
  const query = `SELECT id, username, email, role, avatar_url, created_at FROM users ORDER BY username ASC;`;
  const res = await db.query(query);
  return res.rows;
};

module.exports = {
  initUserModel,
  createUser,
  findUserByEmail,
  findUserByUsername,
  findUserById,
  getAllUsers,
};
