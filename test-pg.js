// test-pg.js
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, 'dbconfig.json');
const raw = fs.readFileSync(configPath);
const cfg = JSON.parse(raw);

// ép password thành string
cfg.password = String(cfg.password || '');

(async () => {
  try {
    const client = new Client(cfg);
    await client.connect();
    const res = await client.query('SELECT version()');
    console.log("✅ Postgres Connected:", res.rows[0].version);
    await client.end();
  } catch (err) {
    console.error("❌ Postgres Connect Error:", err.message);
  }
})();
