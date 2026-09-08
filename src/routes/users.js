const express = require('express');
const { getAllUsers, findUserById } = require('../models/user');

const router = express.Router();

// Get list of all registered users (for assigning tasks)
router.get('/', async (req, res) => {
  try {
    const users = await getAllUsers();
    return res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    console.error('Error fetching users:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Get user profile by ID
router.get('/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ success: false, error: 'Invalid user ID format' });
    }

    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    return res.status(200).json({ success: true, data: user });
  } catch (err) {
    console.error('Error fetching user profile:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
