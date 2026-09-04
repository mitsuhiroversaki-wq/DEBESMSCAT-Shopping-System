const pgPromise = require('pg-promise');
require('dotenv').config();

const pgp = pgPromise();

const db = pgp({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'debesmscat_shopping',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 30, // Maximum pool size
});

// Test connection
db.connect()
  .then(() => {
    console.log('✓ Database connected successfully');
  })
  .catch((error) => {
    console.error('✗ Database connection error:', error);
    process.exit(1);
  });

module.exports = db;
