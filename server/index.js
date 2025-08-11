const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Configuración básica
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Crear directorio para la base de datos si no existe
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Base de datos SQLite
const db = new sqlite3.Database(path.join(dataDir, 'bobs_corn.sqlite'));

// Inicializar base de datos
db.serialize(() => {
  // Tabla para rastrear las compras y limitar la tasa
  db.run(`
    CREATE TABLE IF NOT EXISTS rate_limiter (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id TEXT NOT NULL,
      purchase_time DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Crear índice para búsquedas rápidas
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_client_time ON rate_limiter(client_id, purchase_time)
  `);
  
  console.log('Base de datos inicializada correctamente');
});

// Endpoint para comprar maíz
app.post('/api/buy-corn', (req, res) => {
  const { clientId } = req.body;
  
  if (!clientId) {
    return res.status(400).json({ error: 'Se requiere un ID de cliente' });
  }
  
  // Verificar límite de tasa (1 maíz por minuto)
  db.get(`
    SELECT COUNT(*) as count 
    FROM rate_limiter 
    WHERE client_id = ? AND purchase_time > datetime('now', '-1 minute')
  `, [clientId], (err, row) => {
    if (err) {
      console.error('Error al verificar límite de tasa:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    
    // Si el cliente ya ha comprado maíz en el último minuto
    if (row.count > 0) {
      return res.status(429).json({
        error: 'Demasiadas solicitudes',
        message: 'Solo puedes comprar 1 maíz por minuto'
      });
    }
    
    // Registrar la compra
    db.run('INSERT INTO rate_limiter (client_id) VALUES (?)', [clientId], function(err) {
      if (err) {
        console.error('Error al registrar compra:', err);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }
      
      // Éxito
      res.status(200).json({
        success: true,
        message: 'Compra de maíz exitosa',
        emoji: '🌽'
      });
    });
  });
});

// Endpoint para obtener historial de compras
app.get('/api/purchases/:clientId', (req, res) => {
  const { clientId } = req.params;
  
  if (!clientId) {
    return res.status(400).json({ error: 'Se requiere un ID de cliente' });
  }
  
  // Contar compras totales
  db.get('SELECT COUNT(*) as count FROM rate_limiter WHERE client_id = ?', [clientId], (err, row) => {
    if (err) {
      console.error('Error al obtener historial:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    
    res.status(200).json({
      clientId,
      purchaseCount: row.count
    });
  });
});

// Ruta de salud para verificar que el servidor está funcionando
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Servidor funcionando' });
});

// Servir la aplicación frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});