const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { initSchema } = require('./database/schema');
const { seedData } = require('./database/seed');
const apiRoutes = require('./routes/api');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

// Enable CORS for Vite dev server and local clients
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const zlib = require('node:zlib');

app.use(express.json());

// High-Speed Gzip Compression Middleware for lightning-fast API responses
app.use((req, res, next) => {
  const acceptEncoding = req.headers['accept-encoding'] || '';
  if (!acceptEncoding.includes('gzip')) return next();

  const originalSend = res.send;
  res.send = function (data) {
    if (res.getHeader('Content-Encoding')) {
      return originalSend.call(this, data);
    }
    if (typeof data === 'string' || Buffer.isBuffer(data)) {
      const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
      if (buffer.length > 512) {
        try {
          const gzipped = zlib.gzipSync(buffer, { level: 6 });
          res.setHeader('Content-Encoding', 'gzip');
          res.setHeader('Vary', 'Accept-Encoding');
          res.setHeader('Content-Length', gzipped.length);
          return res.end(gzipped);
        } catch (err) {
          return originalSend.call(this, data);
        }
      }
    }
    return originalSend.call(this, data);
  };
  next();
});

// Initialize database schema and ensure initial seed data
try {
  initSchema();
  seedData(false);
  console.log('[Database] SQLite initialized and operational.');
} catch (err) {
  console.error('[Database Error] Failed to initialize SQLite:', err);
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'SURAKSHA DRISHTI AI',
    version: '1.0.0',
    division: 'National Disaster Management Intelligence',
    timestamp: new Date().toISOString()
  });
});

// Mount REST API
app.use('/api', apiRoutes);

const path = require('node:path');
const os = require('node:os');

// Serve static frontend build with high-performance caching
const frontendDist = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDist, {
  maxAge: '1h',
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    } else if (path.match(/\.(js|css|jpg|jpeg|png|gif|svg|woff2?)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
    }
  }
}));

// SPA catch-all for frontend routes (dashboard, map, habitations, etc.)
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'API endpoint not found' });
  }
  res.sendFile(path.join(frontendDist, 'index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]', err);
  res.status(500).json({
    success: false,
    message: 'An unexpected internal server error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Detect network IPv4 address for multi-device LAN access
function getNetworkIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const networkIp = getNetworkIp();

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🛡️  SURAKSHA DRISHTI AI - UNIFIED LIVE SERVER ONLINE`);
  console.log(`💻  Localhost:        http://localhost:${PORT}`);
  console.log(`📱  Network (Any Device): http://${networkIp}:${PORT}`);
  console.log(`📋  API Health:       http://${networkIp}:${PORT}/api/health`);
  console.log(`=======================================================`);
});

module.exports = { app, server };
