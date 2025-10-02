const express = require('express');
const router = express.Router();
const { getPool } = require('../db');

router.get('/', async (req, res) => {
  const pool = getPool();
  try {
    const result = await pool.query(
      'SELECT id, plate, country, confidence, cameraid, date FROM events ORDER BY id DESC LIMIT 50'
    );
    res.render('dashboard', { rows: result.rows });
  } catch (err) {
    res.send('❌ Error: ' + err.message);
  }
});

module.exports = router;
