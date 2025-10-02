const express = require('express');
const router = express.Router();
const { saveConfig, loadConfig, getPool } = require('../db');

router.get('/', (req, res) => {
  const cfg = loadConfig();
  res.render('config', { cfg, message: null });
});

router.post('/', async (req, res) => {
  const { host, port, user, password, database } = req.body;
  const cfg = { host, port: parseInt(port), user, password, database };
  saveConfig(cfg);
  try {
    const pool = getPool();
    await pool.query('SELECT 1'); // test query
    res.render('config', { cfg, message: '✅ Connected successfully!' });
  } catch (err) {
    res.render('config', { cfg, message: '❌ Error: ' + err.message });
  }
});

module.exports = router;
