# Car Insurance Application - Complete Setup Guide

A full-stack car insurance management system with React frontend and Node.js backend.

## Project Overview

This is a monorepo containing two main applications:
- **Frontend (fe)**: React + Vite + Tailwind CSS
- **Backend (be)**: Node.js + Express + MongoDB

## Quick Start

### Prerequisites

- **Node.js** v18.0.0 or higher
- **npm** v9.0.0 or higher
- **MongoDB** v5.0+ (local) OR Docker
- **Git**

### System Requirements

| Component | Requirement |
|-----------|-------------|
| Node.js | v18.0.0+ |
| npm | v9.0.0+ |
| MongoDB | v5.0+ |
| RAM | 2GB minimum |
| Disk Space | 1GB minimum |

## Directory Structure

```
car-insurance/
├── be/                          # Backend - Node.js + Express + MongoDB
│   ├── src/
│   │   ├── index.js
│   │   ├── controllers/         # Business logic
│   │   ├── models/              # Database models
│   │   ├── routes/              # API endpoints
│   │   └── utils/               # Helper functions
│   ├── .env.example             # Environment template
│   ├── docker-compose.yml       # Docker configuration
│   ├── Dockerfile
│   ├── package.json
│   └── README.md                # Backend documentation
│
├── fe/                          # Frontend - React + Vite + Tailwind
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── pages/               # Page layouts
│   │   ├── assets/              # Static files
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example             # Environment template
│   ├── tailwind.config.js
│   ├── vite.config.js
│   ├── package.json
│   └── README.md                # Frontend documentation
│
└── README.md                    # This file
```

## Setup Instructions

### Option 1: Complete Setup with Docker (Recommended)

Docker automatically manages MongoDB, backend, and all dependencies.

#### Prerequisites
- Docker and Docker Compose installed

#### Steps

1. **Navigate to the backend directory**
```bash
cd be
```

2. **Create `.env` file**
```bash
cp .env.example .env
```

3. **Update `.env` with your credentials**
```bash
# Edit be/.env
# Add your Gmail app password, Stripe keys, and other credentials
```

4. **Start all services**
```bash
docker-compose up --build
```

5. **In a new terminal, setup frontend**
```bash
cd fe
cp .env.example .env.local
# Edit .env.local with your Stripe publishable key and backend URL
npm install
npm run dev
```

6. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- MongoDB: localhost:27017

#### Docker Commands
```bash
# Start containers
docker-compose up

# Stop containers
docker-compose down

# View logs
docker-compose logs -f backend

# Remove everything
docker-compose down -v
```

### Option 2: Local Development Setup

**Prerequisites:**
- MongoDB running locally
- Node.js v18+

#### Backend Setup

1. **Navigate to backend**
```bash
cd be
```

2. **Install dependencies**
```bash
npm install
```

3. **Create environment file**
```bash
cp .env.example .env
```

4. **Configure environment**
Edit `be/.env` with:
- `MONGODB_URI=mongodb://localhost:27017/car-insurance`
- `EMAIL_USER=your-email@gmail.com`
- `EMAIL_PASSWORD=your-app-password`
- `STRIPE_SECRET_KEY=sk_test_...`
- `JWT_SECRET=your-secret-key`

5. **Start MongoDB**
```bash
# Windows
mongod

# macOS/Linux
brew services start mongodb-community
```

6. **Start backend server**
```bash
npm run dev
```

Backend runs on: http://localhost:5000

#### Frontend Setup

1. **In a new terminal, navigate to frontend**
```bash
cd fe
```

2. **Install dependencies**
```bash
npm install
```

3. **Create environment file**
```bash
cp .env.example .env.local
```

4. **Configure environment**
Edit `fe/.env.local` with:
- `VITE_API_URL=http://localhost:5000`
- `VITE_STRIPE_PUBLIC_KEY=pk_test_...`

5. **Start development server**
```bash
npm run dev
```

Frontend runs on: http://localhost:5173

## Environment Configuration

### Backend (.env)

Critical variables:

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/car-insurance

# Email (Gmail)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=app-password  # Use app password, not regular password

# Authentication
JWT_SECRET=generate-strong-random-string

# Stripe
STRIPE_SECRET_KEY=sk_test_your_key

# Server
PORT=5000
NODE_ENV=development
```

### Frontend (.env.local)

Critical variables:

```bash
# Backend API
VITE_API_URL=http://localhost:5000

# Stripe Public Key
VITE_STRIPE_PUBLIC_KEY=pk_test_your_key

# Environment
VITE_APP_ENV=development
```

## Configuration Guides

### Gmail App Password Setup

1. Enable 2-factor authentication in Gmail
2. Go to https://myaccount.google.com/apppasswords
3. Select "Mail" and "Windows Computer"  
4. Generate App Password
5. Use this password in `EMAIL_PASSWORD` (not your regular Gmail password)

### Stripe Setup

1. Create account at https://stripe.com
2. Go to Dashboard → API Keys
3. Copy **Publishable Key** (pk_test_...) → `VITE_STRIPE_PUBLIC_KEY`
4. Copy **Secret Key** (sk_test_...) → `STRIPE_SECRET_KEY`
5. Use test keys during development
6. Never commit keys to version control

### MongoDB Setup

**Local Installation (Windows):**
```bash
# Download from https://www.mongodb.com/try/download/community
# Or use Chocolatey
choco install mongodb-community
mongod
```

**Local Installation (macOS):**
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Cloud Database (MongoDB Atlas):**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create account and cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/car-insurance
```

## API Endpoints Reference

### Authentication
- `POST /api/auth/send-otp` - Send OTP to email
- `POST /api/auth/verify-otp` - Verify OTP and login

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id` - Mark as read

### Payments
- `POST /api/payments/create-intent` - Create Stripe intent
- `POST /api/payments/confirm` - Confirm payment

See [Backend README](be/README.md) for complete API documentation.

## Common Issues & Troubleshooting

### MongoDB Connection Failed
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:**
- Ensure MongoDB is running: `mongod`
- Check `MONGODB_URI` in `.env`
- If using Docker: `docker-compose up mongo`

### Port Already in Use
```
Error: listen EADDRINUSE :::5000
```
**Solution:**
- Change PORT in `.env` to different value
- Or kill process: `lsof -ti:5000 | xargs kill`

### Backend API Connection Failed
```
Error: Network Error or CORS issue
```
**Solution:**
- Check backend is running on `http://localhost:5000`
- Verify `VITE_API_URL` in `.env.local`
- Check browser console for CORS errors

### OTP Not Sending
```
Error: Email service error
```
**Solution:**
- Verify Gmail app password (not regular password)
- Enable 2-factor authentication
- Check `EMAIL_USER` and `EMAIL_PASSWORD` in `.env`

### Stripe Payment Error
```
Error: Stripe key error or invalid configuration
```
**Solution:**
- Use Publishable Key in frontend (pk_test_)
- Use Secret Key in backend (sk_test_)
- Verify keys in `.env` and `.env.local`
- Check console for specific Stripe error

### Vite Port Already in Use
```
Error: Port 5173 is already in use
```
**Solution:**
```bash
npm run dev -- --port 3000
```

## Development Workflow

### Making Changes

1. **Backend Changes**
   - Edit files in `be/src/`
   - Auto-reloads via nodemon
   - Test with API client (Postman, curl, etc.)

2. **Frontend Changes**
   - Edit files in `fe/src/components/`
   - Auto-reloads via Vite HMR
   - Changes visible immediately in browser

3. **Database Schema Changes**
   - Modify models in `be/src/models/`
   - Backup data if needed
   - Restart backend

### Testing API

**Using curl:**
```bash
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

**Using Postman:**
1. Import API endpoints
2. Create requests for each endpoint
3. Test with different payloads

## Building for Production

### Backend Deployment

1. **Build Docker image**
```bash
cd be
docker build -t car-insurance-backend:1.0 .
```

2. **Push to registry**
```bash
docker tag car-insurance-backend:1.0 your-registry/car-insurance-backend:1.0
docker push your-registry/car-insurance-backend:1.0
```

3. **Deploy to production**
   - Update environment variables for production
   - Use production MongoDB database
   - Use production Stripe keys
   - Set `NODE_ENV=production`

### Frontend Deployment

1. **Build for production**
```bash
cd fe
npm run build
```

2. **Preview build**
```bash
npm run preview
```

3. **Deploy dist/ folder**
   - Vercel, Netlify, AWS S3, GitHub Pages, etc.
   - Update `VITE_API_URL` to production backend

### Deployment Checklist

- [ ] Update `.env` with production values
- [ ] Update `VITE_API_URL` to production backend
- [ ] Use production MongoDB database
- [ ] Use production Stripe keys
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS
- [ ] Configure proper error logging
- [ ] Test all features in production
- [ ] Monitor logs and errors
- [ ] Set up automated backups
- [ ] Configure CI/CD pipeline

## Technology Stack

### Frontend
- React 18.2.0
- Vite 5.0.0
- Tailwind CSS 3.4.0
- Stripe React Integration
- Axios
- HTML2Canvas & jsPDF

### Backend
- Node.js 18+
- Express.js
- MongoDB with Mongoose
- Stripe SDK
- SendGrid Email Service
- JWT Authentication

### DevOps
- Docker
- Docker Compose
- MongoDB
- Git/GitHub

## Additional Resources

### Documentation
- [Backend README](be/README.md)
- [Frontend README](fe/README.md)
- [Vite Documentation](https://vitejs.dev)
- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [MongoDB Documentation](https://docs.mongodb.com)

### External Services
- [Stripe Documentation](https://stripe.com/docs)
- [Gmail App Passwords](https://myaccount.google.com/apppasswords)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [SendGrid Documentation](https://docs.sendgrid.com)

## Support & Contribution

### Getting Help
1. Check the [Backend README](be/README.md) for backend issues
2. Check the [Frontend README](fe/README.md) for frontend issues
3. Review error messages in console
4. Check `.env` and `.env.local` configurations

### Contributing
1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License
MIT

For detailed setup instructions for specific components, see:
- [Backend Setup](be/README.md)
- [Frontend Setup](fe/README.md)
