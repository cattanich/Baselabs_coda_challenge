const express = require('express');
const cors = require('cors');
const { initializeDatabase, isWithinRateLimit, recordPurchase, getClientPurchases } = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configuración CORS extremadamente permisiva
app.use((req, res, next) => {
  // Permitir cualquier origen
  res.header('Access-Control-Allow-Origin', '*');
  
  // Permitir cualquier método
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  // Permitir cualquier encabezado
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Manejar preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Middleware para análisis de JSON
app.use(express.json());

// Initialize database on startup
initializeDatabase()
  .then(() => console.log('Database is ready'))
  .catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });

// Middleware para depuración de solicitudes
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  if (req.method === 'POST') {
    console.log('Body:', req.body);
  }
  next();
});

// Endpoint to buy corn
app.post('/api/buy-corn', async (req, res) => {
  try {
    console.log('Received buy-corn request:', req.body);
    const { clientId } = req.body;
    
    // Validate request
    if (!clientId) {
      return res.status(400).json({ error: 'Client ID is required' });
    }
    
    // Check if client is within rate limit
    const withinLimit = await isWithinRateLimit(clientId);
    
    if (!withinLimit) {
      return res.status(429).json({ 
        error: 'Too Many Requests',
        message: 'You can only buy 1 corn per minute'
      });
    }
    
    // Record the purchase
    await recordPurchase(clientId);
    
    // Return success response with status code 200
    return res.status(200).json({ 
      success: true,
      message: 'Corn purchase successful',
      emoji: '🌽'
    });
    
  } catch (error) {
    console.error('Error processing corn purchase:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get client purchase history
app.get('/api/purchases/:clientId', async (req, res) => {
  try {
    console.log('Received purchases request for client:', req.params.clientId);
    const { clientId } = req.params;
    
    // Validate request
    if (!clientId) {
      return res.status(400).json({ error: 'Client ID is required' });
    }
    
    // Get client's purchase count
    const purchaseCount = await getClientPurchases(clientId);
    
    return res.status(200).json({
      clientId,
      purchaseCount
    });
    
  } catch (error) {
    console.error('Error fetching purchase history:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Manejar cualquier otra ruta con un 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`CORS enabled for all origins`);
});