const User = require('../models/User');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

exports.signup = async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;
    const user = new User({ first_name, last_name, email, password });
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
    logger.info('User signed up', { email });
  } catch (error) {
    res.status(400).json({ error: error.message });
    logger.error('Error signing up user', { error: error.message });
  }
};

exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
    logger.info('User signed in', { email });
  } catch (error) {
    res.status(400).json({ error: error.message });
    logger.error('Error signing in user', { error: error.message });
  }
};
