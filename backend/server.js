require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors()); // Allow cross-origin requests from frontend

// Connection pooling for performance
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Endpoint: /items (Cursor-based Pagination)
app.get('/items', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const cursor = req.query.cursor; 

    let query;
    let values;

    if (cursor) {
      // Offset-free cursor pagination: Retrieve elements with IDs smaller than the last seen ID
      query = 'SELECT id, title, description, created_at FROM items WHERE id < $1 ORDER BY id DESC LIMIT $2';
      values = [cursor, limit];
    } else {
      // First payload (No cursor provided)
      query = 'SELECT id, title, description, created_at FROM items ORDER BY id DESC LIMIT $1';
      values = [limit];
    }

    const { rows } = await pool.query(query, values);

    // If we received exactly 'limit' rows, there's likely more data. Set the nextCursor.
    const nextCursor = rows.length === limit ? rows[rows.length - 1].id : null;

    res.json({
      data: rows,
      nextCursor
    });

  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint for deployment validation
app.get('/', (req, res) => {
  res.send('Virtual Scroll API is running!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
