const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)){
  fs.mkdirSync(dataDir);
}

// Database file path
const dbPath = path.join(dataDir, 'bobs_corn.sqlite');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Initialize database with required tables
function initializeDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create rate_limiter table to track client purchases
      db.run(`
        CREATE TABLE IF NOT EXISTS rate_limiter (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          client_id TEXT NOT NULL,
          purchase_time DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('Error creating rate_limiter table:', err);
          reject(err);
          return;
        }
      });
      
      // Create index on client_id and purchase_time
      db.run(`
        CREATE INDEX IF NOT EXISTS idx_client_time ON rate_limiter(client_id, purchase_time)
      `);
      
      // Create corn_purchases table to track total purchases
      db.run(`
        CREATE TABLE IF NOT EXISTS corn_purchases (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          client_id TEXT NOT NULL,
          purchase_time DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('Error creating corn_purchases table:', err);
          reject(err);
          return;
        }
        console.log('Database initialized successfully');
        resolve();
      });
    });
  });
}

// Function to check if a client is within rate limit (1 corn per minute)
function isWithinRateLimit(clientId) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT COUNT(*) as count 
      FROM rate_limiter 
      WHERE client_id = ? AND purchase_time > datetime('now', '-1 minute')
    `;
    
    db.get(query, [clientId], (err, row) => {
      if (err) {
        console.error('Error checking rate limit:', err);
        reject(err);
        return;
      }
      
      // Return true if client is within rate limit (count is 0), false otherwise
      resolve(row.count === 0);
    });
  });
}

// Function to record a purchase
function recordPurchase(clientId) {
  return new Promise((resolve, reject) => {
    // Begin transaction
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');
      
      // Insert record into rate_limiter table
      db.run(
        'INSERT INTO rate_limiter (client_id) VALUES (?)',
        [clientId],
        function(err) {
          if (err) {
            console.error('Error recording in rate_limiter:', err);
            db.run('ROLLBACK');
            reject(err);
            return;
          }
          
          // Insert record into corn_purchases table
          db.run(
            'INSERT INTO corn_purchases (client_id) VALUES (?)',
            [clientId],
            function(err) {
              if (err) {
                console.error('Error recording in corn_purchases:', err);
                db.run('ROLLBACK');
                reject(err);
                return;
              }
              
              // Commit transaction
              db.run('COMMIT');
              resolve(true);
            }
          );
        }
      );
    });
  });
}

// Function to get client purchase history
function getClientPurchases(clientId) {
  return new Promise((resolve, reject) => {
    const query = 'SELECT COUNT(*) as count FROM corn_purchases WHERE client_id = ?';
    
    db.get(query, [clientId], (err, row) => {
      if (err) {
        console.error('Error getting client purchases:', err);
        reject(err);
        return;
      }
      
      resolve(row.count);
    });
  });
}

module.exports = {
  db,
  initializeDatabase,
  isWithinRateLimit,
  recordPurchase,
  getClientPurchases
};