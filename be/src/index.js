import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { connectDB } from './utils/db.js'
import { generalLimiter, authLimiter } from './middleware/rateLimitMiddleware.js'
import { optionalAuthMiddleware } from './middleware/authMiddleware.js'
import authRoutes from './routes/authRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Security Middleware

// Helmet - Sets various HTTP headers for security
app.use(helmet())

// CORS - Restrict to allowed origins only
const allowedOrigins = ('*').split(',')
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc)
    if (!origin) return callback(null, true)
    callback(null, true)
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // 24 hours
}))

app.use(express.json())

// Rate limiting - Apply general rate limiter to all routes
app.use(generalLimiter)

// Optional authentication middleware for all routes
app.use(optionalAuthMiddleware)

// Connect to MongoDB
connectDB()

// Routes
app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/payment', paymentRoutes)
app.use('/api/notifications', notificationRoutes)

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' })
})

// Error handling middleware
app.use((err, req, res, next) => {
  // Handle CORS errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ message: 'Access denied' })
  }
  
  // Generic error handler
  console.error('Unhandled error:', err.message)
  res.status(500).json({ message: 'Internal server error' })
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
})
