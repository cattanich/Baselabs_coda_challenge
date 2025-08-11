const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Basic configuration
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Create directory for database if it doesn't exist
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// SQLite database
const db = new sqlite3.Database(path.join(dataDir, 'bobs_corn.sqlite'));

// Initialize database
db.serialize(() => {
  // Table to track purchases and rate limit
  db.run(`
    CREATE TABLE IF NOT EXISTS rate_limiter (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id TEXT NOT NULL,
      purchase_time DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Create index for fast lookups
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_client_time ON rate_limiter(client_id, purchase_time)
  `);
  
  console.log('Database initialized successfully');
});

// Endpoint to buy corn
app.post('/api/buy-corn', (req, res) => {
  const { clientId } = req.body;
  
  if (!clientId) {
    return res.status(400).json({ error: 'Client ID is required' });
  }
  
  // Check rate limit (1 corn per minute)
  db.get(`
    SELECT COUNT(*) as count 
    FROM rate_limiter 
    WHERE client_id = ? AND purchase_time > datetime('now', '-1 minute')
  `, [clientId], (err, row) => {
    if (err) {
      console.error('Error checking rate limit:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    
    // If client has already purchased corn in the last minute
    if (row.count > 0) {
      return res.status(429).json({
        error: 'Too Many Requests',
        message: 'You can only buy 1 corn per minute'
      });
    }
    
    // Record the purchase
    db.run('INSERT INTO rate_limiter (client_id) VALUES (?)', [clientId], function(err) {
      if (err) {
        console.error('Error recording purchase:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      
      // Success
      res.status(200).json({
        success: true,
        message: 'Corn purchase successful',
        emoji: '🌽'
      });
    });
  });
});

// Endpoint to get purchase history
app.get('/api/purchases/:clientId', (req, res) => {
  const { clientId } = req.params;
  
  if (!clientId) {
    return res.status(400).json({ error: 'Client ID is required' });
  }
  
  // Count total purchases
  db.get('SELECT COUNT(*) as count FROM rate_limiter WHERE client_id = ?', [clientId], (err, row) => {
    if (err) {
      console.error('Error getting purchase history:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    
    res.status(200).json({
      clientId,
      purchaseCount: row.count
    });
  });
});

// Health route to check server is running
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Serve frontend application
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});