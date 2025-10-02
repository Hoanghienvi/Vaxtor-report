const express = require('express');
const router = express.Router();
const { getPool } = require('../db');

router.get('/', async (req, res) => {
  res.render('report', { rows: [], chartData: [] });
});

// API filter theo ngày
router.post('/filter', async (req, res) => {
  const { start, end } = req.body;
  const pool = getPool();
  try {
    const result = await pool.query(
      `SELECT date::date as day, COUNT(DISTINCT plate) as unique_plates
       FROM events
       WHERE date BETWEEN $1 AND $2
       GROUP BY day
       ORDER BY day ASC`,
      [start, end]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
