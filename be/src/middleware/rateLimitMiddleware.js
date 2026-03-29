import rateLimit from 'express-rate-limit'

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Don't rate limit health check
    return req.path === '/health'
  },
})

/**
 * Auth endpoints rate limiter (stricter)
 * 5 OTP requests per 15 minutes per IP
 * Prevents OTP brute forcing
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many OTP requests. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
})

/**
 * Strict rate limiter for sensitive operations
 * 10 requests per hour per IP
 */
export const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: 'Too many requests for this operation. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
})

export default {
  generalLimiter,
  authLimiter,
  strictLimiter,
}
