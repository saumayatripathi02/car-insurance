# Swagger API Documentation

This directory contains the OpenAPI/Swagger specification for the Car Insurance API.

## Files

- **swagger.yaml** - OpenAPI 3.0 specification in YAML format
- **swagger.json** - OpenAPI 3.0 specification in JSON format

## Using the Swagger Documentation

### 1. View Documentation Locally

#### Option A: Using Swagger UI (Recommended)

1. Install Swagger UI Express in the backend:
```bash
npm install swagger-ui-express
```

2. Add to your `src/index.js`:
```javascript
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './docs/swagger.js'; // or require YAML with `yaml` package

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
```

3. Access the Swagger UI at: `http://localhost:5000/api-docs`

#### Option B: Using Stoplight Proxy

Visit: https://stoplight.io/prism/try?specUrl=file:///path/to/swagger.yaml

### 2. Convert Between Formats

**YAML to JSON:**
```bash
npm install -g swagger-cli
swagger-cli bundle swagger.yaml --outfile swagger.json --type json
```

**JSON to YAML:**
```bash
npm install -g js-yaml
js-yaml swagger.json > swagger.json
```

### 3. Validate Specification

```bash
npm install -g swagger-cli
swagger-cli validate swagger.yaml
```

### 4. Generate API Clients

**Generate JavaScript/TypeScript client:**
```bash
npm install -g openapi-generator-cli
openapi-generator-cli generate -i swagger.yaml -g typescript-fetch -o ./generated-client
```

**Generate Python client:**
```bash
openapi-generator-cli generate -i swagger.yaml -g python -o ./generated-client-python
```

## API Endpoints Overview

### Authentication
- `POST /api/auth/send-otp` - Send OTP to email
- `POST /api/auth/verify-otp` - Verify OTP and get JWT token

### Notifications
- `GET /api/notifications` - Get all notifications
- `PUT /api/notifications/{id}` - Mark notification as read
- `DELETE /api/notifications/{id}` - Delete notification

### Payments
- `POST /api/payments/create-intent` - Create Stripe payment intent
- `POST /api/payments/confirm` - Confirm payment

### Health
- `GET /api/health` - Health check

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

The JWT token is obtained from the `/api/auth/verify-otp` endpoint after successful OTP verification.

## Request Examples

### Send OTP

```bash
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

### Verify OTP

```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","otp":"123456"}'
```

### Get Notifications

```bash
curl -X GET http://localhost:5000/api/notifications?limit=10 \
  -H "Authorization: Bearer <jwt_token>"
```

### Create Payment Intent

```bash
curl -X POST http://localhost:5000/api/payments/create-intent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt_token>" \
  -d '{
    "amount": 1000,
    "currency": "usd",
    "policyId": "507f1f77bcf86cd799439011",
    "description": "Car Insurance Premium"
  }'
```

## Error Responses

All error responses follow a consistent format:

```json
{
  "message": "Error description",
  "code": "ERROR_CODE",
  "timestamp": "2026-02-17T10:30:00Z",
  "details": {}
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|------------|-------------|
| INVALID_EMAIL | 400 | Invalid email format |
| INVALID_OTP | 400 | OTP is incorrect |
| OTP_EXPIRED | 400 | OTP has expired (older than 5 minutes) |
| RATE_LIMIT_EXCEEDED | 429 | Too many requests from this IP/email |
| ACCOUNT_LOCKED | 429 | Account locked due to failed attempts |
| MISSING_TOKEN | 401 | Authorization header is missing |
| INVALID_TOKEN | 401 | JWT token is invalid or expired |
| NOT_FOUND | 404 | Resource not found |
| INTERNAL_ERROR | 500 | Server error |

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Global**: 100 requests per 15 minutes
- **Send OTP**: 3 requests per 15 minutes per email
- **Verify OTP**: 10 requests per 15 minutes per email

Rate limit headers in response:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1645011000
```

## Integration Guide

### Frontend Integration (React/Axios)

```javascript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Create API instance with base URL
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Example: Send OTP
export const sendOtp = (email) => {
  return apiClient.post('/api/auth/send-otp', { email });
};

// Example: Verify OTP
export const verifyOtp = (email, otp) => {
  return apiClient.post('/api/auth/verify-otp', { email, otp });
};

// Example: Get Notifications
export const getNotifications = (limit = 20, skip = 0) => {
  return apiClient.get('/api/notifications', {
    params: { limit, skip },
  });
};
```

### Backend Integration (Node.js Testing)

```javascript
const axios = require('axios');

const apiClient = axios.create({
  baseURL: 'http://localhost:5000',
});

async function testAuthFlow() {
  try {
    // Send OTP
    const otpRes = await apiClient.post('/api/auth/send-otp', {
      email: 'test@example.com',
    });
    console.log('OTP sent:', otpRes.data);

    // Verify OTP (use actual OTP from email)
    const verifyRes = await apiClient.post('/api/auth/verify-otp', {
      email: 'test@example.com',
      otp: '123456',
    });
    console.log('Login successful:', verifyRes.data);
    
    return verifyRes.data.token;
  } catch (error) {
    console.error('Error:', error.response?.data);
  }
}
```

## Testing

### Using Postman

1. Import the `swagger.json` into Postman
2. Postman will automatically create collections for each endpoint
3. Add environment variables for `base_url` and `jwt_token`
4. Test endpoints directly from Postman

### Using cURL

See examples in the "Request Examples" section above.

### Using Insomnia

1. Import `swagger.yaml` into Insomnia
2. Create environment variables
3. Test all endpoints from the interface

## Deployment

When deploying to production:

1. Update the server URL in `swagger.yaml`
2. Ensure all API endpoints are accessible
3. Document any additional authentication requirements
4. Include Swagger UI for internal use or public API documentation
5. Consider using an API gateway for version management

## Support

For issues or questions about the API:
- Check the endpoint documentation in `swagger.yaml`
- Review error codes and messages
- Contact the backend team

## Related Documentation

- [Backend README](../../README.md)
- [Backend Setup Guide](../../README.md)
- [OpenAPI 3.0 Specification](https://spec.openapis.org/oas/v3.0.0)
- [Swagger Tools](https://swagger.io/tools/)
