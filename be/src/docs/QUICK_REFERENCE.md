# Quick Reference - Car Insurance API

## Base URL
```
Development: https://letmbe--fso2a2w.ashydune-d638a33c.westus2.azurecontainerapps.io
Production: https://api.yourdomain.com
```

## Authentication
All protected endpoints require JWT token in header:
```
Authorization: Bearer <jwt_token>
```

---

## Summary of Endpoints

### 🔐 Authentication Endpoints

#### Send OTP
```
POST /api/auth/send-otp
Content-Type: application/json

✓ Public endpoint (no auth required)
✗ Rate limited: 3 requests/15 min per email
⏱ Response time: ~2-5 seconds

Request:
{
  "email": "user@example.com"
}

Response (200):
{
  "message": "OTP sent successfully",
  "email": "user@example.com",
  "expiresIn": 300
}

Errors:
- 400: INVALID_EMAIL
- 429: RATE_LIMIT_EXCEEDED
- 500: Email service error
```

#### Verify OTP
```
POST /api/auth/verify-otp
Content-Type: application/json

✓ Public endpoint (no auth required)
✗ Rate limited: 10 requests/15 min per email
✗ Locked after 3 failed attempts (15 min)

Request:
{
  "email": "user@example.com",
  "otp": "123456"
}

Response (200):
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "expiresIn": 604800
}

Errors:
- 400: INVALID_OTP, OTP_EXPIRED
- 404: No OTP request found
- 429: ACCOUNT_LOCKED
- 500: Server error
```

---

### 🔔 Notification Endpoints

#### Get All Notifications
```
GET /api/notifications?limit=20&skip=0&read=false
Authorization: Bearer <jwt_token>

✓ Protected endpoint
✓ Paginated results
? Query params: limit (1-100), skip, read (boolean)

Response (200):
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "type": "payment_reminder",
      "title": "Payment Due",
      "message": "Your monthly insurance premium is due on February 20th",
      "read": false,
      "actionUrl": "/payments/policy-123",
      "createdAt": "2026-02-17T10:30:00Z"
    }
  ],
  "total": 5,
  "limit": 20,
  "skip": 0
}

Errors:
- 401: MISSING_TOKEN, INVALID_TOKEN
- 500: Server error
```

#### Mark Notification as Read
```
PUT /api/notifications/{id}
Authorization: Bearer <jwt_token>
Content-Type: application/json

✓ Protected endpoint

Request:
{
  "read": true
}

Response (200):
{
  "success": true,
  "message": "Notification marked as read",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "read": true,
    "updatedAt": "2026-02-17T10:35:00Z"
  }
}

Errors:
- 401: Unauthorized
- 404: Notification not found
- 500: Server error
```

#### Delete Notification
```
DELETE /api/notifications/{id}
Authorization: Bearer <jwt_token>

✓ Protected endpoint

Response (200):
{
  "success": true,
  "message": "Notification deleted successfully"
}

Errors:
- 401: Unauthorized
- 404: Not found
- 500: Server error
```

---

### 💳 Payment Endpoints

#### Create Stripe Payment Intent
```
POST /api/payments/create-intent
Authorization: Bearer <jwt_token>
Content-Type: application/json

✓ Protected endpoint
✗ Requires Stripe API key
? Amount in cents (minimum: 50 = $0.50)

Request:
{
  "amount": 5000,
  "currency": "usd",
  "policyId": "507f1f77bcf86cd799439011",
  "description": "Car Insurance Premium"
}

Response (201):
{
  "success": true,
  "data": {
    "clientSecret": "pi_1234567890_secret_0987654321",
    "publicKey": "pk_test_1234567890",
    "paymentIntentId": "pi_1234567890",
    "amount": 5000,
    "currency": "usd"
  }
}

Errors:
- 400: INVALID_AMOUNT, INVALID_CURRENCY
- 401: Unauthorized
- 404: Policy not found
- 500: Stripe API error
```

#### Confirm Payment
```
POST /api/payments/confirm
Authorization: Bearer <jwt_token>
Content-Type: application/json

✓ Protected endpoint
✗ Call after Stripe payment succeeds

Request:
{
  "paymentIntentId": "pi_1234567890",
  "policyId": "507f1f77bcf86cd799439011",
  "metadata": {
    "invoiceNumber": "INV-2026-001"
  }
}

Response (200):
{
  "success": true,
  "message": "Payment confirmed and processed",
  "data": {
    "transactionId": "txn_1234567890",
    "paymentIntentId": "pi_1234567890",
    "amount": 5000,
    "currency": "usd",
    "status": "succeeded",
    "timestamp": "2026-02-17T10:30:00Z"
  }
}

Errors:
- 400: PAYMENT_DECLINED, INVALID_INTENT_ID
- 401: Unauthorized
- 404: Policy or PaymentIntent not found
- 500: Stripe API error
```

---

### 🏥 Health Check

#### Health Status
```
GET /api/health

✓ Public endpoint (no auth required)
? No parameters

Response (200):
{
  "status": "ok",
  "timestamp": "2026-02-17T10:30:00Z",
  "uptime": 3600
}
```

---

## Supported Currencies

- `usd` - US Dollar
- `eur` - Euro
- `gbp` - British Pound
- `cad` - Canadian Dollar
- `aud` - Australian Dollar

---

## Notification Types

| Type | Description |
|------|-------------|
| `policy_update` | Policy information has been updated |
| `payment_reminder` | Payment due soon |
| `payment_confirmation` | Payment was successfully processed |
| `policy_expiry` | Policy is expiring soon |
| `quote_available` | New quote available |

---

## Error Codes

| Code | Description | HTTP Status |
|------|-------------|------------|
| INVALID_EMAIL | Email format is invalid | 400 |
| INVALID_OTP | OTP is incorrect | 400 |
| OTP_EXPIRED | OTP has expired | 400 |
| INVALID_AMOUNT | Payment amount is invalid | 400 |
| INVALID_CURRENCY | Currency not supported | 400 |
| RATE_LIMIT_EXCEEDED | Too many requests | 429 |
| ACCOUNT_LOCKED | Account locked after failed attempts | 429 |
| MISSING_TOKEN | Auth token missing | 401 |
| INVALID_TOKEN | Auth token invalid/expired | 401 |
| NOT_FOUND | Resource not found | 404 |
| PAYMENT_DECLINED | Card declined by issuer | 400 |
| INTERNAL_ERROR | Server error | 500 |

---

## Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| Global | 100 requests | 15 minutes |
| Send OTP | 3 requests | 15 minutes per email |
| Verify OTP | 10 requests | 15 minutes per email |

Response headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1645011000
```

---

## Common cURL Examples

### Send OTP
```bash
curl -X POST https://letmbe--fso2a2w.ashydune-d638a33c.westus2.azurecontainerapps.io/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

### Verify OTP and Login
```bash
curl -X POST https://letmbe--fso2a2w.ashydune-d638a33c.westus2.azurecontainerapps.io/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","otp":"123456"}'
```

### Get Notifications
```bash
curl -X GET "https://letmbe--fso2a2w.ashydune-d638a33c.westus2.azurecontainerapps.io/api/notifications?limit=10" \
  -H "Authorization: Bearer your_jwt_token_here"
```

### Create Payment Intent
```bash
curl -X POST https://letmbe--fso2a2w.ashydune-d638a33c.westus2.azurecontainerapps.io/api/payments/create-intent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_jwt_token_here" \
  -d '{
    "amount": 5000,
    "currency": "usd",
    "policyId": "507f1f77bcf86cd799439011",
    "description": "Car Insurance Premium"
  }'
```

### Confirm Payment
```bash
curl -X POST https://letmbe--fso2a2w.ashydune-d638a33c.westus2.azurecontainerapps.io/api/payments/confirm \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_jwt_token_here" \
  -d '{
    "paymentIntentId": "pi_1234567890",
    "policyId": "507f1f77bcf86cd799439011"
  }'
```

---

## Testing Tools

- **Postman**: Import `swagger.json` automatically creates collection
- **Insomnia**: Import `swagger.yaml` for full API interface
- **Thunder Client**: VS Code extension with Swagger support
- **Swagger UI**: Visit `/api-docs` after starting server with Swagger setup
- **cURL**: Use examples above for quick testing

---

## Documentation

- Full specification: `be/src/docs/swagger.yaml`
- Integration guide: `be/src/docs/README.md`
- Setup example: `be/src/docs/INTEGRATION_EXAMPLE.js`

Last Updated: February 17, 2026
