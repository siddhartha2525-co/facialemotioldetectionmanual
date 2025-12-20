require('dotenv').config();

const config = {
  PORT: process.env.PORT || 5001,
  PY_API: process.env.PY_API || 'http://localhost:8000/analyze',
  MONGO_URI: process.env.MONGO_URI || '',
  NODE_ENV: process.env.NODE_ENV || 'development'
};

module.exports = config;
