const express = require('express');
const path = require('path');
const fs = require('fs');
const { Client } = require('pg');
const expressLayouts = require('express-ejs-layouts');

const app = express();
const PORT = 3002;
const CONFIG_FILE = path.join(__dirname, 'dbconfig.json');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Load DB config
function loadConfig() {
  if (fs.existsSync(CONFIG_FILE)) {
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  }
  return { host: '', port: 5432, user: '', password: '', database: '' };
}

// Create Postgres client
function createClient() {
  const cfg = loadConfig();
  cfg.password = String(cfg.password || '');
  return new Client(cfg);
}

// Settings routes
app.get('/settings', (req, res) => {
  res.render('settings', { layout: 'layout', config: loadConfig() });
});

app.post('/api/test-db', async (req, res) => {
  const cfg = req.body;
  cfg.password = String(cfg.password || '');
  const client = new Client(cfg);
  try {
    await client.connect();
    const r = await client.query('SELECT NOW() as now');
    await client.end();
    res.json({ success: true, message: `✅ Connected! Server time: ${r.rows[0].now}` });
  } catch (err) {
    res.json({ success: false, message: `❌ ${err.message}` });
  }
});

app.post('/api/save-db', (req, res) => {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(req.body, null, 2));
  res.json({ success: true, message: 'Config saved!' });
});

// Dashboard: last 50 rows
app.get('/', async (req, res) => {
  let rows = [];
  try {
    const client = createClient();
    await client.connect();
    const result = await client.query(`
      SELECT id, plate, country, confidence, processingtime, cameraid, date 
      FROM plates ORDER BY id DESC LIMIT 50
    `);
    rows = result.rows;
    await client.end();
  } catch (err) {
    console.error("Dashboard error:", err.message);
  }
  res.render('dashboard', { layout: 'layout', rows });
});

// Report: group by date & camera
app.get('/report', async (req, res) => {
  let stats = [];
  try {
    const client = createClient();
    await client.connect();
    const result = await client.query(`
      SELECT DATE(date) as day, cameraid, COUNT(DISTINCT plate) as unique_plates
      FROM plates
      GROUP BY day, cameraid
      ORDER BY day DESC, cameraid
    `);
    stats = result.rows;
    await client.end();
  } catch (err) {
    console.error("Report error:", err.message);
  }
  res.render('report', { layout: 'layout', stats });
});

app.listen(PORT, () => {
  console.log(`🚀 Web running at http://localhost:${PORT}`);
});
