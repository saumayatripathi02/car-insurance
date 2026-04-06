# Car Insurance Backend API

Node.js + Express backend for Car Insurance application with MongoDB, Stripe integration, and email notifications.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Technology Stack](#technology-stack)

## Prerequisites

### System Requirements
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: v5.0 or higher (for local development without Docker)
- **Docker & Docker Compose**: (optional, for containerized setup)

### External Services
- **Gmail Account**: For sending OTP and notification emails
- **SendGrid API Key**: (optional) For email delivery
- **Stripe Account**: For payment processing

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd be
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy the `.env.example` file to create your `.env` file:

```bash
cp .env.example .env
```

Then edit `.env` with your configuration values (see [Environment Setup](#environment-setup) section).

## Environment Setup

### Create `.env` File

Create a `.env` file in the `be/` directory with the following variables:

```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/car-insurance

# Email Configuration (Gmail)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# SendGrid (Alternative email service)
SENDGRID_API_KEY=your-sendgrid-api-key

# Authentication
JWT_SECRET=your-super-secret-jwt-key

# OTP Settings
OTP_EXPIRY=300000

# Payment Processing
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key

# API Configuration
API_URL=https://letmbe--fso2a2w.ashydune-d638a33c.westus2.azurecontainerapps.io
```

### Important Configuration Notes

**Email Setup (Gmail):**
1. Enable 2-factor authentication on your Gmail account
2. Generate an [App Password](https://myaccount.google.com/apppasswords)
3. Use this app password in `EMAIL_PASSWORD`

**Stripe Setup:**
1. Get your API keys from [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Use the test keys during development
3. Add `STRIPE_SECRET_KEY` to your `.env`

## Running the Application

### Option 1: Local Development (without Docker)

#### Prerequisites
- MongoDB running locally on port 27017

#### Steps

1. Start MongoDB:
```bash
# On Windows
mongod

# On macOS/Linux
brew services start mongodb-community
```

2. Start the development server:
```bash
npm run dev
```

The server will start on `https://letmbe--fso2a2w.ashydune-d638a33c.westus2.azurecontainerapps.io` with auto-reload enabled.

### Option 2: Docker Setup (Recommended)

Docker automatically sets up both MongoDB and Node.js server.

#### Prerequisites
- Docker and Docker Compose installed

#### Steps

1. Build and start containers:
```bash
docker-compose up --build
```

2. The server will be available at `https://letmbe--fso2a2w.ashydune-d638a33c.westus2.azurecontainerapps.io`

3. MongoDB will be accessible at `localhost:27017`

#### Useful Docker Commands

```bash
# Start containers
docker-compose up

# Stop containers
docker-compose down

# View logs
docker-compose logs -f backend

# Stop and remove volumes
docker-compose down -v
```

### Option 3: Production Build

```bash
npm run start
```

## API Endpoints

### Authentication

#### Send OTP
- **POST** `/api/auth/send-otp`
- **Body**: `{ "email": "user@example.com" }`
- **Response**: `{ "message": "OTP sent successfully", "email": "user@example.com" }`

#### Verify OTP
- **POST** `/api/auth/verify-otp`
- **Body**: `{ "email": "user@example.com", "otp": "123456" }`
- **Response**: `{ "message": "Login successful", "token": "jwt-token", "user": { ... } }`

### Notifications

#### Get User Notifications
- **GET** `/api/notifications`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Array of notification objects

#### Mark as Read
- **PUT** `/api/notifications/:id`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Updated notification object

### Payments

#### Create Payment Intent
- **POST** `/api/payments/create-intent`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ "amount": 1000, "currency": "usd" }`
- **Response**: `{ "clientSecret": "pi_...", "publicKey": "pk_..." }`

#### Confirm Payment
- **POST** `/api/payments/confirm`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ "paymentIntentId": "pi_...", "policyId": "..." }`
- **Response**: `{ "message": "Payment confirmed", "transactionId": "..." }`

## Project Structure

```
be/
├── src/
│   ├── index.js                 # Application entry point
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── notificationController.js
│   │   └── paymentController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Policy.js
│   │   └── Notification.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── notificationRoutes.js
│   │   └── paymentRoutes.js
│   └── utils/
│       ├── db.js                # Database connection
│       └── mailer.js            # Email sending utility
├── .env.example                 # Example environment variables
├── docker-compose.yml           # Docker configuration
├── Dockerfile                   # Docker image definition
├── package.json
└── README.md
```

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT)
- **Payment Processing**: Stripe
- **Email**: SendGrid / Gmail
- **Development**: Nodemon
- **Containerization**: Docker

## Dependencies

```json
{
  "@sendgrid/mail": "Email delivery service",
  "cors": "Enable Cross-Origin Resource Sharing",
  "dotenv": "Environment variables management",
  "express": "Web framework",
  "jsonwebtoken": "JWT authentication",
  "mongoose": "MongoDB ODM",
  "stripe": "Payment processing"
}
```

## Development Notes

### Common Issues and Solutions

**MongoDB Connection Failed**
- Ensure MongoDB is running: `mongod` (local) or `docker-compose up` (Docker)
- Check `MONGODB_URI` in `.env`

**OTP Not Sending**
- Verify Gmail app password is correct
- Enable "Less secure app access" if using regular Gmail password
- Check SendGrid API key if using SendGrid

**Stripe Errors**
- Ensure you're using test keys from Stripe dashboard
- Check that `STRIPE_SECRET_KEY` is correct

**Port Already in Use**
- Change `PORT` in `.env` to an available port
- Or kill the process: `lsof -ti:5000 | xargs kill`

## Deployment

For production deployment:

1. Set `NODE_ENV=production` in `.env`
2. Use strong, randomly generated `JWT_SECRET`
3. Use production Stripe keys (not test keys)
4. Configure proper email service
5. Set up proper MongoDB Atlas cluster or self-hosted MongoDB
6. Deploy using Docker or Node.js hosting platform (Vercel, Heroku, AWS, etc.)

## Support

For issues and questions, please check the main project README or contact the development team.
- `EMAIL_USER`: Email address for sending OTPs
- `EMAIL_PASSWORD`: Email app password
- `OTP_EXPIRY`: OTP expiry time in milliseconds (default: 300000 = 5 minutes)

## Notes

- For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833)
- OTP is valid for 5 minutes by default
- Update `.env` file with your email credentials before running
