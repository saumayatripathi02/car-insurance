import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

/**
 * Authentication Middleware
 * Verifies JWT token from Authorization header
 * Prevents query parameter authentication (security issue)
 */
export const authMiddleware = (req, res, next) => {
  try {
    // Extract token from Authorization header (Bearer scheme)
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized: Missing or invalid token' })
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    // Attach user info to request
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized: Invalid token' })
  }
}

/**
 * Optional Authentication Middleware
 * Tries to verify token but doesn't fail if missing
 * Useful for endpoints that accept both authenticated and unauthenticated requests
 */
export const optionalAuthMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.user = decoded
    }
    next()
  } catch (error) {
    // Token verification failed, but continue without user context
    // This is intentional for optional auth endpoints
    next()
  }
}

export default authMiddleware
