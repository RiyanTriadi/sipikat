const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const path = require('path');
const { apiLimiter } = require('./middleware/rateLimiter');
const { startTokenBlacklistCleanup } = require('./services/tokenBlacklistCleanup');
require('dotenv').config();

const app = express();

// 1. Trust Proxy
app.set('trust proxy', 1);

// 2. Security Headers Middleware 
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "http:"], 
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

// 3. CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',      
  'https://edu-sipikat.com',  
  'https://www.edu-sipikat.com',
  process.env.FRONTEND_URL      
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true, 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Set-Cookie']
}));

// 4. Parsers
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 5. Serve Static Files
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// 5.1 General API Rate Limiter
app.use('/api', apiLimiter);

// 6. Import Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const gejalaRoutes = require('./routes/gejala');
const artikelRoutes = require('./routes/artikel');
const diagnosaRoutes = require('./routes/diagnosa');
const solusiRoutes = require('./routes/solusi');
const aktivitasRoutes = require('./routes/aktivitas');
const uploadRoutes = require('./routes/upload');
const pageRoutes = require('./routes/page');

// ROOT ENDPOINT 
app.get('/', (req, res) => {
  res.status(200).json({ 
    success: true,
    message: 'SIPIKAT API Server',
    version: '1.0.0',
    status: 'running',
    environment: process.env.NODE_ENV,
    endpoints: [
      '/health',
      '/api/auth',
      '/api/gejala',
      '/api/diagnosa'
    ]
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin/users', userRoutes);
app.use('/api/gejala', gejalaRoutes);
app.use('/api/artikel', artikelRoutes);
app.use('/api/diagnosa', diagnosaRoutes);
app.use('/api/solusi', solusiRoutes);
app.use('/api/aktivitas', aktivitasRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/pages', pageRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint tidak ditemukan', path: req.path });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('ERROR LOG:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Terjadi kesalahan server',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Allowed Origins: ${allowedOrigins.join(', ')}`);
});

const blacklistCleanupInterval = startTokenBlacklistCleanup();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  clearInterval(blacklistCleanupInterval);
  server.close(() => {
    console.log('HTTP server closed');
  });
});
