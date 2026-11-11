const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const courseRoutes = require('./routes/course.routes');
const affiliateRoutes = require('./routes/affiliate.routes');
const walletRoutes = require('./routes/wallet.routes');
const adminRoutes = require('./routes/admin.routes');
const invoiceRoutes = require('./routes/invoice.routes');
const certificateRoutes = require('./routes/certificate.routes');
const forumRoutes = require('./routes/forum.routes');
const adminForumRoutes = require('./routes/adminForum.routes');

const app = express();

// Security headers
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS — allow all localhost Vite dev ports (5173, 5174, etc.) + production CLIENT_URL
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  process.env.CLIENT_URL,
].filter(Boolean); // remove undefined

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, Postman, curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error(`CORS: Origin "${origin}" is not allowed.`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many auth attempts. Try again after 15 minutes.' },
});
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many password reset requests. Please try again after 15 minutes.' },
});

app.use('/api', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/signup', authLimiter);
app.use('/api/auth/forgot-password', forgotPasswordLimiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitize request data against NoSQL operator injection
const sanitizeNoSQL = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete obj[key];
    } else if (typeof obj[key] === 'object') {
      sanitizeNoSQL(obj[key]);
    }
  }
  return obj;
};

app.use((req, res, next) => {
  if (req.body) sanitizeNoSQL(req.body);
  if (req.query) sanitizeNoSQL(req.query);
  if (req.params) sanitizeNoSQL(req.params);
  next();
});

// Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Protect KYC documents: Only authenticated admins or document owners can access
app.use(
  '/uploads/kyc',
  async (req, res, next) => {
    try {
      const { verifyAccessToken } = require('./utils/jwt');
      const Session = require('./models/Session');
      const User = require('./models/User');

      let token = null;
      if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
      } else if (req.query && req.query.token) {
        token = req.query.token;
      }

      if (!token) {
        return res.status(401).json({ success: false, message: 'Authentication required to access KYC documents.' });
      }

      const decoded = verifyAccessToken(token);
      const session = await Session.findOne({ token, isActive: true });
      if (!session) {
        return res.status(401).json({ success: false, message: 'Session expired or invalid.' });
      }

      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found.' });
      }

      // Admin or owner only
      const isOwner = req.path.includes(user._id.toString());
      if (user.role !== 'admin' && !isOwner) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }

      next();
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' });
    }
  },
  express.static(path.join(process.cwd(), 'uploads/kyc'))
);

// Static files (uploaded media: thumbnails, videos, forum attachments, resources)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/affiliate', affiliateRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/admin/forum', adminForumRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'CourseEarn LMS API is running 🚀', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

module.exports = app;
