const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs'); 
require('dotenv').config();

const app = express();

// 0. Initial Setup & Validation
const uploadDir = path.resolve(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`[System] Folder uploads dibuat di: ${uploadDir}`);
}

// 1. Security Middlewares
app.set('trust proxy', 1); 

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "http:"], 
      connectSrc: ["'self'", "https:", "http:"], 
    },
  },
  hsts: {
    maxAge: 31536000, 
    includeSubDomains: true,
    preload: true
  },
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true,
  crossOriginResourcePolicy: { policy: "cross-origin" }, 
}));

// 2. CORS Configuration 
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  process.env.FRONTEND_URL, 
  'https://edu-sipikat.com', 
  'https://www.edu-sipikat.com',
  // Tambahkan subdomain lain jika ada
].filter(Boolean); 

console.log('✅ Allowed CORS Origins:', allowedOrigins);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `CORS policy: Origin ${origin} is not allowed. Allowed origins: ${allowedOrigins.join(', ')}`;
      console.error(msg);
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true, 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Set-Cookie']
}));

// Explicit OPTIONS handler for preflight
app.options('*', cors());

// 3. Parsers & Static Files
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files dengan CORS headers yang benar
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.header('Cache-Control', 'public, max-age=31536000');
  next();
}, express.static(uploadDir));

// 4. Import Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const gejalaRoutes = require('./routes/gejala');
const artikelRoutes = require('./routes/artikel');
const diagnosaRoutes = require('./routes/diagnosa');
const solusiRoutes = require('./routes/solusi');
const aktivitasRoutes = require('./routes/aktivitas');
const uploadRoutes = require('./routes/upload');
const pageRoutes = require('./routes/page');

// 5. App Routes

// Root Route
app.get('/', (req, res) => {
  res.json({
    message: 'Backend SiPikat is Running Successfully! 🚀',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/admin/users', userRoutes);
app.use('/api/gejala', gejalaRoutes);
app.use('/api/artikel', artikelRoutes);
app.use('/api/diagnosa', diagnosaRoutes);
app.use('/api/solusi', solusiRoutes);
app.use('/api/aktivitas', aktivitasRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/pages', pageRoutes);

// 6. Error Handling
// 404 Handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: `Endpoint ${req.originalUrl} tidak ditemukan di server ini.` 
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Error Log]:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Terjadi kesalahan internal server',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 7. Server Initialization
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`=================================`);
  console.log(`Server running on port ${PORT}`);
  console.log(`Static files: ${uploadDir}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`CORS Origins: ${allowedOrigins.join(', ')}`);
  console.log(`=================================`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

module.exports = app;