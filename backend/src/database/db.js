const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');

const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'suraksha.db');
const db = new DatabaseSync(dbPath);

// Enable WAL mode, memory caching, and foreign keys for sub-millisecond query performance
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA synchronous = NORMAL;');
db.exec('PRAGMA cache_size = -64000;'); // 64MB memory cache
db.exec('PRAGMA temp_store = MEMORY;');

module.exports = db;
