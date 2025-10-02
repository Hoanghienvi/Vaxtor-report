// db.js
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, 'dbconfig.json');

function loadDbConfig() {
  if (fs.existsSync(configPath)) {
    const raw = fs.readFileSync(configPath);
    const cfg = JSON.parse(raw);

    // Đảm bảo password là string
    if (cfg.password === undefined || cfg.password === null) {
      cfg.password = '';
    } else {
      cfg.password = String(cfg.password);
    }
    return cfg;
  }
  return {
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '',
    database: 'vaxtor_db'
  };
}

const dbConfig = loadDbConfig();
const pool = new Pool(dbConfig);

module.exports = pool;
