# Car Insurance Project - OWASP Top 5 Security Audit Report

## Executive Summary
This security audit identified **14 critical and high-severity vulnerabilities** across the Node.js/Express backend and React frontend, covering 5 of the OWASP Top 10 categories. The application handles sensitive financial and personal data but lacks essential security controls.

---

## OWASP Top 5 Vulnerabilities Found

### 1. BROKEN AUTHENTICATION

#### 1.1 Authentication Logic Passed via Insecure Query Parameters
**Severity:** CRITICAL  
**Category:** Broken Authentication / Sensitive Data Exposure

**Location:**
- [be/src/controllers/notificationController.js](be/src/controllers/notificationController.js#L1-L28) - `getNotifications()` function
- [be/src/controllers/notificationController.js](be/src/controllers/notificationController.js#L80-L110) - `markAllAsRead()` function  
- [be/src/controllers/paymentController.js](be/src/controllers/paymentController.js#L210-L240) - `getAllPolicies()` function

**Issue:**
```javascript
// Line 6-28 in notificationController.js
const { email, token } = req.query  // ⛔ MAJOR ISSUE
```

Authentication credentials are extracted from query parameters instead of HTTP headers:
- Credentials are **logged in server access logs**
- Credentials are **cached in browser history**
- Credentials are **visible in the URL bar**
- Credentials can be **leaked in referrer headers**

**Impact:**
- Attackers can intercept tokens and email addresses from logs/cache/referrer
- Any user can access any other user's data by knowing their email
- Email becomes a de-facto password

**Proof of Concept:**
```bash
# Attacker can:
GET /api/notifications/list?email=victim@example.com&token=<stolen_token>
GET /api/payment/policies?email=victim@example.com
```

**Fix:**
- Move credentials to `Authorization` header (Bearer token)
- Use separate authentication middleware
- Never pass sensitive data in query parameters

---

#### 1.2 Missing Authentication Middleware
**Severity:** CRITICAL  
**Category:** Broken Authentication

**Location:**
- [be/src/routes/notificationRoutes.js](be/src/routes/notificationRoutes.js)
- [be/src/routes/paymentRoutes.js](be/src/routes/paymentRoutes.js)
- [be/src/routes/authRoutes.js](be/src/routes/authRoutes.js)

**Issue:**
All routes lack authentication middleware. Anyone can access:
- `/api/notifications/list` - retrieve any user's notifications
- `/api/payment/policies` - retrieve any user's policies  
- `/api/payment/policy/:policyId` - retrieve any policy details
- `/api/notifications/:notificationId/read` - modify any notification

**Current Code:**
```javascript
// paymentRoutes.js - NO MIDDLEWARE
router.post('/create-payment-intent', createPaymentIntent)
router.post('/confirm-payment', confirmPayment)
router.get('/policy/:policyId', getPolicyDetails)  // ⛔ No auth check
router.get('/policies', getAllPolicies)             // ⛔ No auth check
```

**Impact:**
- Horizontal privilege escalation: users can view policies of other users
- Sensitive personal and financial data exposure

**Required Fix:**
Create and apply authentication middleware to all protected routes.

---

#### 1.3 Weak OTP Implementation - No Rate Limiting
**Severity:** HIGH  
**Category:** Broken Authentication

**Location:**
- [be/src/controllers/authController.js](be/src/controllers/authController.js#L10-L50) - `sendOtp()` function

**Issue:**
```javascript
export const sendOtp = async (req, res) => {
  const { email } = req.body
  const otp = generateOtp()  // Simple 6-digit number
  // ⛔ NO RATE LIMITING
  // ⛔ OTP CAN BE BRUTE FORCED
}
```

**Problems:**
- No rate limiting on OTP requests (attacker can request unlimited OTPs)
- OTP is just a 6-digit number (only 1 million possibilities)
- No IP-based rate limiting
- No account lockout after failed attempts
- OTPs exposed in email (plaintext)

**Attack Scenario:**
```javascript
// Attacker can brute force in seconds:
for (let i = 0; i < 1000000; i++) {
  POST /api/auth/verify-otp { email: "victim@example.com", otp: "000000" + i }
}
```

**Impact:**
- Anyone can takeover any email account by brute-forcing the 6-digit OTP
- Unlimited OTP generation causes email service abuse

**Required Fix:**
- Implement rate limiting (max 3 attempts per email, 5-minute cooldown)
- Add account lockout after 5 failed attempts
- Higher entropy OTP (8+ characters) or timestamp-based tokens
- Rate limit OTP generation (1 per minute per email)

---

### 2. SENSITIVE DATA EXPOSURE

#### 2.1 Insecure Token Storage in localStorage
**Severity:** HIGH  
**Category:** Sensitive Data Exposure

**Location:**
- [fe/src/components/Login.jsx](fe/src/components/Login.jsx#L56-L58)
- [fe/src/components/Home.jsx](fe/src/components/Home.jsx#L35-L36)
- [fe/src/components/MyPolicies.jsx](fe/src/components/MyPolicies.jsx#L22)
- [fe/src/components/Notifications.jsx](fe/src/components/Notifications.jsx#L26)
- [fe/src/components/Payment.jsx](fe/src/components/Payment.jsx#L77)

**Issue:**
```javascript
// Login.jsx - Line 56-58
localStorage.setItem('token', response.data.token)
localStorage.setItem('user', JSON.stringify(response.data.user))
```

**Problems:**
- localStorage is vulnerable to XSS attacks
- Data persists even after browser close
- No expiration without explicit deletion
- Data accessible to all scripts on the page
- JavaScript malware can steal tokens

**Impact:**
- If any XSS vulnerability exists, attacker can steal all user tokens
- Stolen tokens have no expiration until user logs out
- Long-lived access for attackers

**Required Fix:**
- Use `httpOnly` cookies with Secure flag (stored browser-side, not accessible to JS)
- Set appropriate `maxAge` / expiration
- Use `SameSite=Strict` to prevent CSRF
- Implement token refresh mechanism
- Never store sensitive data in localStorage

---

#### 2.2 Hardcoded Stripe Public Key in Frontend Code
**Severity:** LOW (Acceptable for public keys)  
**Category:** Sensitive Data Exposure / Security Misconfiguration

**Location:**
- [fe/src/components/Payment.jsx](fe/src/components/Payment.jsx#L13-L20)

**Issue:**
```javascript
const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(
      'pk_test_51K3ExmSIhFhL0IRQ70R7a7cMX86xnwoWbQFXYKnwp0tw0LrkHa8CT0mvCypjTy5whMlfvPYvU9rxSfLFltikwoRe00ZEGydMlx'
    ) // ⚠️ Hardcoded Stripe Public Key
  }
}
```

**Note:** This is actually acceptable because `pk_test_` keys are meant to be public. However, it should come from environment config in production.

**Impact:**
- Stripe key is for test mode (lower risk)
- In production, should be in environment config

---

#### 2.3 Sensitive Error Messages Exposed to Clients
**Severity:** MEDIUM  
**Category:** Sensitive Data Exposure / Information Disclosure

**Location:**
- [be/src/controllers/paymentController.js](be/src/controllers/paymentController.js#L49) - Line 49
- [be/src/controllers/paymentController.js](be/src/controllers/paymentController.js#L163)
- [be/src/controllers/notificationController.js](be/src/controllers/notificationController.js#L46)
- [be/src/controllers/paymentController.js](be/src/controllers/paymentController.js#L258)

**Issue:**
```javascript
// paymentController.js - Line 49
catch (error) {
  console.error('Create payment intent error:', error)
  return res.status(500).json({ message: error.message })  // ⛔ EXPOSES ERROR DETAILS
}
```

**Problems:**
- Backend error messages sent to client
- May reveal database structure, API details, or system information
- Helps attackers understand system internals
- Stack traces can be leaked

**Example:**
- MongoDB connection strings from errors
- Stripe API error details
- Database schema information

**Impact:**
- Information disclosure enables targeted attacks
- Helps attackers understand system weaknesses

**Required Fix:**
- Log full error details server-side only
- Return generic messages to clients: `{ message: "An error occurred" }`
- Use error codes instead of messages

---

#### 2.4 Enable Source Maps in Production Build
**Severity:** MEDIUM  
**Category:** Sensitive Data Exposure / Information Disclosure

**Location:**
- [fe/vite.config.js](fe/vite.config.js#L10)

**Issue:**
```javascript
build: {
  outDir: 'dist',
  sourcemap: true  // ⛔ PRODUCTION SOURCE MAPS ENABLED
}
```

**Problems:**
- Source maps expose original TypeScript/JSX code in production
- Attackers can debug minified code
- Reveals business logic, hardcoded values, and variable names
- Increases attack surface significantly

**Impact:**
- Complete source code is visible to attackers
- Business logic exposed
- Easier to find and exploit vulnerabilities

**Required Fix:**
- Disable sourcemaps in production:
```javascript
sourcemap: process.env.NODE_ENV === 'development'
```

---

#### 2.5 Debug Mode Enabled in Docker Compose
**Severity:** MEDIUM  
**Category:** Security Misconfiguration / Information Disclosure

**Location:**
- [be/docker-compose.yml](be/docker-compose.yml#L26)

**Issue:**
```yaml
environment:
  NODE_ENV: development  # ⛔ DEVELOPMENT MODE IN DOCKER
```

**Problems:**
- Enables debug logging and verbose error messages
- Stack traces exposed in API responses
- All console.log() output visible
- Performance monitoring disabled

**Impact:**
- Information disclosure through logs
- No protection against vulnerabilities
- Sensitive data potentially logged

---

### 3. BROKEN ACCESS CONTROL

#### 3.1 Missing Authorization Checks on Policy Access
**Severity:** CRITICAL  
**Category:** Broken Access Control

**Location:**
- [be/src/controllers/paymentController.js](be/src/controllers/paymentController.js#L176-L200) - `getPolicyDetails()` function

**Issue:**
```javascript
export const getPolicyDetails = async (req, res) => {
  const { policyId } = req.params
  
  // ⛔ NO AUTHORIZATION CHECK
  const policy = await Policy.findById(policyId)
  
  // ⛔ RETURNS POLICY TO ANYONE WHO KNOWS THE ID
  return res.status(200).json({ policy })
}
```

**Problems:**
- No verification that requesting user owns the policy
- Any user can query any `policyId` if they guess or enumerate IDs
- Horizontal privilege escalation

**Attack Scenario:**
```bash
# Attacker can retrieve all policies:
GET /api/payment/policy/507f1f77bcf86cd799439011  # User A's policy
GET /api/payment/policy/507f1f77bcf86cd799439012  # User B's policy
GET /api/payment/policy/507f1f77bcf86cd799439013  # User C's policy
```

**Impact:**
- Leakage of sensitive insurance policy data (coverage, amount, car details)
- Exposure of other users' email addresses and car information
- Potential identity theft or fraud

**Required Fix:**
```javascript
// Verify ownership before returning policy
const policy = await Policy.findById(policyId)
if (!policy || (policy.userId && policy.userId !== req.user.id)) {
  return res.status(403).json({ message: 'Unauthorized' })
}
```

---

#### 3.2 Missing Authorization on Notification Updates
**Severity:** HIGH  
**Category:** Broken Access Control

**Location:**
- [be/src/controllers/notificationController.js](be/src/controllers/notificationController.js#L64-L77) - `markAsRead()` function

**Issue:**
```javascript
export const markAsRead = async (req, res) => {
  const { notificationId } = req.params
  
  // ⛔ NO CHECK THAT USER OWNS NOTIFICATION
  const notification = await Notification.findByIdAndUpdate(
    notificationId,
    { status: 'read' },
    { new: true }
  )
  
  return res.status(200).json({ notification })
}
```

**Problems:**
- Any user can mark any notification as read
- No ownership verification
- Allows tampering with other users' data

**Attack:**
```bash
# Attacker marks victim's payment notification as read:
PUT /api/notifications/507f1f77bcf86cd799439050/read
```

**Impact:**
- Data tampering
- Denial of service (hide notifications from users)
- Information about other users' activities

---

### 4. SECURITY MISCONFIGURATION

#### 4.1 CORS Configured to Allow All Origins
**Severity:** CRITICAL  
**Category:** Security Misconfiguration / CORS Misconfiguration

**Location:**
- [be/src/index.js](be/src/index.js#L15)

**Issue:**
```javascript
// index.js - Line 15
app.use(cors())  // ⛔ ALLOWS ANY ORIGIN
```

**Problems:**
- Default CORS allows requests from **any domain**
- Enables CSRF attacks
- Any website can make authenticated requests to this API
- No origin validation

**Impact:**
- CSRF attacks: malicious site can perform actions as logged-in users
- Token theft via cross-origin requests
- API can be used by third-party sites without authorization

**Required Fix:**
```javascript
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
```

---

#### 4.2 Missing Security Headers
**Severity:** HIGH  
**Category:** Security Misconfiguration

**Location:**
- [be/src/index.js](be/src/index.js)

**Issue:**
No security headers are set:
- ❌ No `Content-Security-Policy` (CSP) - prevents XSS
- ❌ No `X-Frame-Options` - prevents clickjacking
- ❌ No `X-Content-Type-Options: nosniff` - prevents MIME sniffing
- ❌ No `Strict-Transport-Security` - enforces HTTPS
- ❌ No `X-XSS-Protection` - XSS protection

**Code:**
```javascript
// app.use(helmet())  // NOT PRESENT - helmet package not in dependencies
```

**Impact:**
- Vulnerable to XSS attacks
- Vulnerable to clickjacking
- MIME type confusion attacks
- Missing HTTPS enforcement

**Required Fix:**
```javascript
import helmet from 'helmet'
app.use(helmet())
```

---

#### 4.3 No Input Validation on Critical Endpoints
**Severity:** HIGH  
**Category:** Injection / Security Misconfiguration

**Location:**
- [be/src/controllers/authController.js](be/src/controllers/authController.js#L10-L20) - `sendOtp()` function
- [be/src/controllers/paymentController.js](be/src/controllers/paymentController.js#L14-L25) - `createPaymentIntent()` function

**Issue:**
```javascript
// authController.js - Line 10-20
export const sendOtp = async (req, res) => {
  const { email } = req.body
  
  if (!email) {  // ⛔ ONLY CHECKS IF EMPTY
    return res.status(400).json({ message: 'Email is required' })
  }
  
  // ⛔ NO EMAIL FORMAT VALIDATION
  // ⛔ NO LENGTH VALIDATION
  // ⛔ NO INJECTION PROTECTION
}
```

**Specific Vulnerabilities:**

1. **No Email Format Validation:**
```javascript
// Invalid emails accepted:
const email = "'; DROP TABLE users; --"
const email = "<script>alert('xss')</script>"
const email = "x".repeat(10000)  // DOS via email length
```

2. **No Input Type Validation:**
```javascript
// payment Controller.js - Line 14-25
export const createPaymentIntent = async (req, res) => {
  const { email, amount, carDetails, planDetails } = req.body
  
  // ⛔ NO VALIDATION ON:
  // - email format
  // - amount type/range (negative? NaN?)
  // - carDetails structure
  // - planDetails values
}
```

**Impact:**
- NoSQL injection via Email/carDetails fields
- Buffer overflow via long inputs
- Type confusion attacks
- Invalid amounts in payment processing

---

#### 4.4 No Rate Limiting Implemented
**Severity:** HIGH  
**Category:** Security Misconfiguration / DoS

**Location:**
- [be/src/index.js](be/src/index.js) - entire application

**Issue:**
- No rate limiting middleware
- Can send unlimited OTPs (`/send-otp`)
- Can brute force login (`/verify-otp`)
- Can spam notifications retrieval
- Can enumerate policies (`/policies?email=...`)

**Attack:**
```bash
# Unlimited OTP requests
while true; do
  curl -X POST http://localhost:5000/api/auth/send-otp \
    -d "{\"email\":\"victim@example.com\"}" \
    -H "Content-Type: application/json"
done

# Brute force OTP
for i in {000000..999999}; do
  curl -X POST http://localhost:5000/api/auth/verify-otp \
    -d "{\"email\":\"victim@example.com\",\"otp\":\"$i\"}" \
    -H "Content-Type: application/json"
done
```

**Impact:**
- DoS attacks
- Email spam/abuse
- Account takeover (OTP brute force)
- Resource exhaustion

---

### 5. INJECTION VULNERABILITIES (Limited but Present)

#### 5.1 Potential NoSQL Injection via Email Fields
**Severity:** MEDIUM  
**Category:** NoSQL Injection

**Location:**
- [be/src/controllers/notificationController.js](be/src/controllers/notificationController.js#L28) - `getNotifications()` function
- [be/src/controllers/paymentController.js](be/src/controllers/paymentController.js#L223) - `getAllPolicies()` function

**Issue:**
```javascript
// notificationController.js - Line 28
if (email) {
  searchCriteria.email = email  // ⛔ NO SANITIZATION
}

// Queries database with unsanitized email
const notifications = await Notification.find(searchCriteria)
```

**Potential Attack:**
```javascript
// Attacker could send:
GET /api/notifications/list?email={"$ne": null}

// This becomes:
Notification.find({ email: { "$ne": null } })
// Returns ALL notifications for all users
```

**Required Fix:**
```javascript
// Validate email format
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  return res.status(400).json({ message: 'Invalid email' })
}
```

---

## Summary Table

| # | Vulnerability | Category | Severity | File | Line |
|---|---|---|---|---|---|
| 1 | Auth via Query Parameters | Broken Auth | CRITICAL | notificationController.js | 6 |
| 2 | Missing Auth Middleware | Broken Auth | CRITICAL | All routes | - |
| 3 | Missing Authorization Checks | Access Control | CRITICAL | paymentController.js | 181 |
| 4 | CORS Open to All Origins | Misconfiguration | CRITICAL | index.js | 15 |
| 5 | No OTP Rate Limiting | Broken Auth | HIGH | authController.js | 20 |
| 6 | Tokens in localStorage | Sensitive Data | HIGH | Login.jsx | 56 |
| 7 | Missing Security Headers | Misconfiguration | HIGH | index.js | - |
| 8 | No Input Validation | Injection | HIGH | authController.js | 15 |
| 9 | No Rate Limiting | Misconfiguration | HIGH | index.js | - |
| 10 | Error Messages Exposed | Information Disclosure | MEDIUM | paymentController.js | 49 |
| 11 | Sourcemaps Enabled | Information Disclosure | MEDIUM | vite.config.js | 10 |
| 12 | Debug Mode in Production | Misconfiguration | MEDIUM | docker-compose.yml | 26 |
| 13 | Missing Auth on Updates | Access Control | HIGH | notificationController.js | 69 |
| 14 | NoSQL Injection Potential | Injection | MEDIUM | notificationController.js | 28 |

---

## Recommendations - Priority Order

### CRITICAL (Fix Immediately)
1. **Move authentication to Authorization header**
   - Implement middleware to extract Bearer tokens
   - Remove query parameter auth

2. **Add authentication/authorization middleware**
   - Create middleware to verify JWT on all protected routes
   - Validate policy/notification ownership before operations

3. **Fix CORS configuration**
   - Whitelist specific origins only
   - Disable credentials if not needed

### HIGH (Fix This Week)
4. **Implement rate limiting**
   - Use `express-rate-limit` package
   - Limit OTP generation (1/min per email)
   - Limit OTP verification (3 attempts, 5-min cooldown)
   - Limit API endpoints (100 req/min per IP)

5. **Switch to httpOnly cookies**
   - Set Secure + SameSite flags
   - Implement refresh token mechanism

6. **Add input validation**
   - Use `joi` or `express-validator`
   - Validate email, amount, car details

7. **Add security headers**
   - Install `helmet` package
   - Use Content-Security-Policy, X-Frame-Options, etc.

### MEDIUM (Fix This Month)
8. **Disable source maps in production**
9. **Add comprehensive input sanitization**
10. **Implement proper error handling** (generic messages to clients)
11. **Set NODE_ENV=production in Docker**
12. **Add logging/monitoring for security events**

---

## Testing the Vulnerabilities

### 1. Test CORS
```bash
curl -H "Origin: http://attacker.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: X-Custom-Header" \
  -X OPTIONS http://localhost:5000/api/auth/send-otp -v
```

### 2. Test Missing Auth
```bash
# Try to access notifications without proper auth
curl http://localhost:5000/api/notifications/list?email=victim@example.com
```

### 3. Test CSRF
From external website:
```html
<form action="http://localhost:5000/api/payment/confirm-payment" method="POST">
  <input name="email" value="victim@example.com">
  <input name="amount" value="99999">
  <input type="submit">
</form>
```

### 4. Test Authorization
```bash
# Get a legitimate policy ID, then try as different user
curl http://localhost:5000/api/payment/policy/507f1f77bcf86cd799439011?token=other_user_token
```

---

## Conclusion

This application has **critical security vulnerabilities** that must be addressed before production deployment. The most urgent issues are:

1. Migrating from query parameter to header-based authentication
2. Implementing proper authorization middleware
3. Fixing CORS configuration
4. Adding rate limiting

The codebase shows good structural practices (separate controllers, models, routes) but lacks fundamental security implementations. Address these issues using industry-standard packages and practices before any production deployment.

