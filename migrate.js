// migrate.js
const sqlite3 = require('sqlite3').verbose();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, 'dbconfig.json');
const raw = fs.readFileSync(configPath);
const pgConfig = JSON.parse(raw);

// ép password thành string
pgConfig.password = String(pgConfig.password || '');

(async () => {
  const pgClient = new Client(pgConfig);

  try {
    await pgClient.connect();
    console.log("✅ Connected to Postgres");
  } catch (err) {
    console.error("❌ Connect failed:", err.message);
    return;
  }

  // Kiểm tra / tạo bảng plates
  await pgClient.query(`
    CREATE TABLE IF NOT EXISTS plates (
      id SERIAL PRIMARY KEY,
      plate VARCHAR(20),
      confidence INT,
      country VARCHAR(10),
      processingtime FLOAT,
      direction VARCHAR(20),
      cameraid VARCHAR(50),
      date TIMESTAMP,
      plateimagefile VARCHAR(255),
      envimagefile VARCHAR(255)
    )
  `);

  // Kết nối SQLite
  const sqlitePath = path.join(__dirname, 'vaxtor_events.sqlite');
  const sqliteDb = new sqlite3.Database(sqlitePath);

  sqliteDb.all("SELECT id, plate, confidence, country, processingtime, date FROM events", async (err, rows) => {
    if (err) {
      console.error("❌ SQLite error:", err.message);
      return;
    }
    console.log(`📦 Found ${rows.length} rows in SQLite`);

    for (const row of rows) {
      try {
        await pgClient.query(
          `INSERT INTO plates (plate, confidence, country, processingtime, date)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            row.plate || null,
            row.confidence || 0,
            row.country || null,
            row.processingtime || 0,
            row.date || null
          ]
        );
      } catch (e) {
        console.error(`❌ Insert failed for plate ${row.plate}:`, e.message);
      }
    }

    console.log("✅ Migration completed!");
    sqliteDb.close();
    await pgClient.end();
  });
})();
