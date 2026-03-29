# Security Configuration Guide

## Environment Variables Required

### Backend (.env)
```
# Core
NODE_ENV=production
PORT=5000
JWT_SECRET=<generate-strong-random-string>
JWT_EXPIRY=24h

# Database
MONGODB_URI=mongodb://mongo:27017/car-insurance

# CORS - Restrict to your domains only
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-service-email@gmail.com
EMAIL_PASSWORD=your-app-password

# OTP
OTP_EXPIRY=300000

# Payment (Stripe)
STRIPE_SECRET_KEY=<your-stripe-secret-key>

# SendGrid (if using SendGrid instead of Gmail)
SENDGRID_API_KEY=<your-sendgrid-api-key>
```

### Frontend (.env)
```
VITE_API_BASE_URL=https://api.yourdomain.com
```

## Security Features Implemented

### 1. Authentication & Authorization
- ✅ JWT token-based authentication
- ✅ Required Authorization header (Bearer scheme)
- ✅ Input validation to prevent NoSQL injection
- ✅ User-specific data access control (horizontal privilege escalation prevention)

### 2. Rate Limiting
- ✅ General API rate limit: 100 requests/15 minutes per IP
- ✅ Auth endpoint rate limit: 5 OTP requests/15 minutes per IP
- ✅ Prevents brute force attacks on OTP (1 million combinations)

### 3. CORS Protection
- ✅ CORS restricted to whitelisted origins only
- ✅ Prevents cross-origin attacks
- ✅ Credentials-enabled for secure requests

### 4. Security Headers
- ✅ Helmet.js for HTTP security headers
- ✅ CSP, X-Frame-Options, HSTS, etc.
- ✅ Protects against clickjacking, XSS, and other attacks

### 5. Error Handling
- ✅ Sensitive error messages sanitized
- ✅ Stack traces not exposed to clients
- ✅ Proper HTTP status codes

### 6. Input Validation
- ✅ Email format validation
- ✅ OTP format validation (6 digits)
- ✅ Amount validation for payments
- ✅ Car details validation
- ✅ Protection against injection attacks

### 7. Data Security
- ✅ JWT expiry set to 24 hours (configurable)
- ✅ OTP expiry set to 5 minutes
- ✅ No sensitive data in error messages
- ✅ Tokens in Authorization header, not query parameters

### 8. Production Hardening
- ✅ Source maps disabled in production
- ✅ Console logs removed in production
- ✅ Debug mode disabled (NODE_ENV=production)
- ✅ Minified and optimized build

## Installation & Setup

### 1. Install Dependencies
```bash
cd be
npm install
```

### 2. Generate JWT Secret
```bash
# On Linux/Mac:
openssl rand -base64 32

# On Windows PowerShell:
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

### 3. Configure Environment Variables
```bash
cp .env.example .env
# Edit .env with your values
```

### 4. Docker Setup (Production)
```bash
# Build and run with docker-compose
docker-compose up -d

# Ensure JWT_SECRET and ALLOWED_ORIGINS are set in environment
export JWT_SECRET=your-generated-secret
export ALLOWED_ORIGINS=https://yourdomain.com
```

## API Usage with Security

### Authenticated Requests
All authenticated endpoints require the Authorization header with Bearer token:

```javascript
// Using the provided axios client
import apiClient from './utils/axiosConfig'

// Token is automatically added to header
const response = await apiClient.get('/api/notifications/list')
```

### Example Request Flow
1. User sends email to `/api/auth/send-otp`
2. User receives OTP via email
3. User sends email + OTP to `/api/auth/verify-otp`
4. Backend returns JWT token
5. Frontend stores token securely (with tokenStorage utility)
6. All subsequent requests include token in Authorization header

## Security Best Practices

### For Developers
- Always use HTTPS in production
- Rotate JWT secrets regularly
- Keep dependencies updated
- Use strong, unique passwords
- Enable 2FA on all production systems

### For Deployment
- Set `NODE_ENV=production` in all production environments
- Use environment-specific secrets management
- Enable HTTPS/TLS everywhere
- Configure CORS for actual domains only
- Implement request logging and monitoring
- Set up security alerts

### For Users
- Don't share tokens
- Use unique email addresses
- Enable 2FA where available
- Report security issues responsibly

## Monitoring & Logging

Monitor these suspicious activities:
- Multiple failed OTP verification attempts
- Requests from unknown origins (blocked by CORS)
- Excessive rate limit violations
- Unauthorized access attempts (403 responses)

## Next Steps for Enhanced Security

1. **Implement HTTPS/TLS** - Use SSL certificates
2. **Database Encryption** - Encrypt sensitive fields in MongoDB
3. **API Key Rotation** - Implement automatic secret rotation
4. **IP Whitelisting** - Restrict admin endpoints to specific IPs
5. **Web Application Firewall** - Use AWS WAF or Cloudflare
6. **Security Audits** - Regular penetration testing
7. **Incident Response** - Document and practice incident handling
8. **DLP (Data Loss Prevention)** - Monitor sensitive data access

## Questions?

Refer to OWASP Top 10 for comprehensive security guidance:
https://owasp.org/www-project-top-ten/
