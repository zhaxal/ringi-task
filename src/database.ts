/* eslint-disable @typescript-eslint/no-unused-vars */
import { Pool } from 'pg';
import initDatabase from '@/utils/initDB';

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: 5432,
});

// Initialize database on first connection
pool.connect(async (err, client, release) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  try {
    await initDatabase();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  } finally {
    release();
  }
});

export default pool;
