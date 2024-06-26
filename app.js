const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const blogRoutes = require('./routes/blogs');
const logger = require('./utils/logger');

dotenv.config();

const app = express();
app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => logger.info('Connected to MongoDB'))
  .catch(err => logger.error('Could not connect to MongoDB', { error: err.message }));

app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);

app.use((err, req, res, next) => {
  logger.error(err.message, { stack: err.stack });
  res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = app;
