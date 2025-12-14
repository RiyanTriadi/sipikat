const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

const app = express();

// 1. TRUST PROXY CONFIGURATION
app.set('trust proxy', true);

// 2. SECURITY HEADERS MIDDLEWARE
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "http:"], 
      connectSrc: ["'self'", process.env.FRONTEND_URL || "'self'"],
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

// 3. CORS CONFIGURATION
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'https://edu-sipikat.com',
  'https://www.edu-sipikat.com',
  'http://localhost:3000',
  'http://localhost:5173'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(null, false);
    }
  },
  credentials: true, 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 86400 
}));

// Handle preflight requests
app.options('*', cors());

// 4. BODY PARSERS
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 5. REQUEST LOGGING (Development only)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// 6. SERVE STATIC FILES
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads'), {
  maxAge: '1d', // Cache for 1 day
  etag: true
}));

// 7. IMPORT ROUTES
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const gejalaRoutes = require('./routes/gejala');
const artikelRoutes = require('./routes/artikel');
const diagnosaRoutes = require('./routes/diagnosa');
const solusiRoutes = require('./routes/solusi');
const aktivitasRoutes = require('./routes/aktivitas');
const uploadRoutes = require('./routes/upload');
const pageRoutes = require('./routes/page');

// 8. ROOT ENDPOINT 
app.get('/', (req, res) => {
  res.status(200).json({ 
    success: true,
    message: '🚀 SIPIKAT API Server',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    documentation: {
      endpoints: {
        health: '/health',
        auth: '/api/auth',
        users: '/api/admin/users',
        gejala: '/api/gejala',
        diagnosa: '/api/diagnosa',
        artikel: '/api/artikel',
        solusi: '/api/solusi',
        aktivitas: '/api/aktivitas',
        upload: '/api/upload',
        pages: '/api/pages'
      },
      publicEndpoints: [
        'GET /api/gejala',
        'GET /api/artikel',
        'GET /api/artikel/:slug',
        'POST /api/diagnosa',
        'POST /api/auth/admin/login',
        'GET /api/pages/:slug'
      ],
      protectedEndpoints: [
        'All /api/admin/* routes',
        'POST /api/artikel',
        'PUT /api/artikel/:id',
        'DELETE /api/artikel/:id',
        'GET /api/diagnosa',
        'And more...'
      ]
    }
  });
});

// 9. HEALTH CHECK ENDPOINT
app.get('/health', (req, res) => {
  res.status(200).json({ 
    success: true,
    status: 'OK',
    service: 'SIPIKAT API',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    uptimeFormatted: formatUptime(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    database: 'Connected', // You can add actual DB check here
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
    }
  });
});

// Helper function for uptime formatting
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  return `${days}d ${hours}h ${minutes}m ${secs}s`;
}

// 10. API STATUS ENDPOINT
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SIPIKAT API is running',
    version: '1.0.0',
    availableRoutes: [
      '/api/auth',
      '/api/admin/users',
      '/api/gejala',
      '/api/artikel',
      '/api/diagnosa',
      '/api/solusi',
      '/api/aktivitas',
      '/api/upload',
      '/api/pages'
    ]
  });
});

// 11. API ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/admin/users', userRoutes);
app.use('/api/gejala', gejalaRoutes);
app.use('/api/artikel', artikelRoutes);
app.use('/api/diagnosa', diagnosaRoutes);
app.use('/api/solusi', solusiRoutes);
app.use('/api/aktivitas', aktivitasRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/pages', pageRoutes);

// 12. 404 HANDLER
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Endpoint tidak ditemukan',
    requestedPath: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
    suggestion: 'Cek /health untuk status server atau / untuk dokumentasi API'
  });
});

// 13. GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
  // Log error details
  console.error('❌ Error occurred:');
  console.error('Time:', new Date().toISOString());
  console.error('Path:', req.path);
  console.error('Method:', req.method);
  console.error('Error:', err.message);
  
  if (process.env.NODE_ENV === 'development') {
    console.error('Stack:', err.stack);
  }

  // Send error response
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Terjadi kesalahan server',
    path: req.path,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      error: err 
    })
  });
});

// 14. SERVER INITIALIZATION
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  console.log('');
  console.log('='.repeat(50));
  console.log('🚀 SIPIKAT API Server Started');
  console.log('='.repeat(50));
  console.log(`📍 Host: ${HOST}`);
  console.log(`🔌 Port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'Not set'}`);
  console.log(`💾 Database: ${process.env.DB_NAME || 'Not configured'}`);
  console.log(`📁 Static Files: ${path.join(__dirname, 'public/uploads')}`);
  console.log(`⏰ Started at: ${new Date().toLocaleString('id-ID')}`);
  console.log('='.repeat(50));
  console.log('✅ Server is ready to accept connections');
  console.log('');
  
  // Test database connection on startup
  testDatabaseConnection();
});

// 15. DATABASE CONNECTION TEST
async function testDatabaseConnection() {
  try {
    const pool = require('./config/db');
    const [rows] = await pool.execute('SELECT 1 as test');
    console.log('✅ Database connection: OK');
  } catch (error) {
    console.error('❌ Database connection: FAILED');
    console.error('Error:', error.message);
    console.error('⚠️  Server started but database is not connected!');
  }
}

// 16. GRACEFUL SHUTDOWN
const gracefulShutdown = (signal) => {
  console.log('');
  console.log(`\n${signal} signal received: closing HTTP server gracefully`);
  
  server.close(() => {
    console.log('✅ HTTP server closed');
    
    // Close database connections
    const pool = require('./config/db');
    pool.end()
      .then(() => {
        console.log('✅ Database connections closed');
        process.exit(0);
      })
      .catch((err) => {
        console.error('❌ Error closing database:', err);
        process.exit(1);
      });
  });

  // Force close after 30 seconds
  setTimeout(() => {
    console.error('⚠️  Forcing shutdown after 30s timeout');
    process.exit(1);
  }, 30000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// 17. UNCAUGHT EXCEPTION HANDLER
process.on('uncaughtException', (err) => {
  console.error('❌ UNCAUGHT EXCEPTION! Shutting down...');
  console.error('Error:', err.name, err.message);
  console.error('Stack:', err.stack);
  process.exit(1);
});

// 18. UNHANDLED REJECTION HANDLER
process.on('unhandledRejection', (err) => {
  console.error('❌ UNHANDLED REJECTION! Shutting down...');
  console.error('Error:', err);
  server.close(() => {
    process.exit(1);
  });
});

// Export for testing purposes
module.exports = app;