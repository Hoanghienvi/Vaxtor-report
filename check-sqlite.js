// check-sqlite.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const sqlitePath = path.join(__dirname, 'vaxtor_events.sqlite');
const db = new sqlite3.Database(sqlitePath);

db.all("SELECT id, plate, country, date FROM events LIMIT 5", (err, rows) => {
  if (err) {
    console.error("❌ SQLite error:", err.message);
  } else {
    console.log("✅ Sample rows from SQLite:", rows);
  }
  db.close();
});
