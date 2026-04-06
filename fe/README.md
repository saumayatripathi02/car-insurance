# Car Insurance App - Frontend

React + Vite frontend application for Car Insurance management system with Tailwind CSS and Stripe integration.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Running the Application](#running-the-application)
- [Building for Production](#building-for-production)
- [Project Structure](#project-structure)
- [Development](#development)
- [Technology Stack](#technology-stack)

## Prerequisites

### System Requirements
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Backend Services
- **Backend API**: Running on `https://letmbe--fso2a2w.ashydune-d638a33c.westus2.azurecontainerapps.io` (during development)
- **Stripe Account**: For payment processing

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd fe
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy the `.env.example` file to create your `.env.local` file:

```bash
cp .env.example .env.local
```

Then edit `.env.local` with your configuration values (see [Environment Setup](#environment-setup) section).

## Environment Setup

### Create `.env.local` File

Create a `.env.local` file in the `fe/` directory with the following variables:

```bash
# Backend API Configuration
VITE_API_URL=https://letmbe--fso2a2w.ashydune-d638a33c.westus2.azurecontainerapps.io

# Stripe Public Key (for client-side)
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key

# Application Environment
VITE_APP_ENV=development
```

### Important Configuration Notes

**Stripe Setup:**
1. Get your Publishable Key from [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Use the test keys during development (starts with `pk_test_`)
3. Add `VITE_STRIPE_PUBLIC_KEY` to your `.env.local`

**Backend API URL:**
- Development: `https://letmbe--fso2a2w.ashydune-d638a33c.westus2.azurecontainerapps.io`
- Production: Your deployed backend URL

**Environment Variables Naming:**
- All variables must be prefixed with `VITE_` to be accessible in the frontend
- Reference them as `import.meta.env.VITE_VARIABLE_NAME` in code

## Running the Application

### Development Mode

1. Start the development server:
```bash
npm run dev
```

2. Open your browser and navigate to:
```
http://localhost:5173
```

The app will automatically reload when you make changes to the code (Hot Module Replacement).

### Build for Production

1. Create an optimized production build:
```bash
npm run build
```

2. Preview the production build locally:
```bash
npm run preview
```

### Code Quality

**Run ESLint** to check for code quality issues:
```bash
npm run lint
```

## Project Structure

```
fe/
├── src/
│   ├── components/              # Reusable React components
│   │   ├── Home.jsx
│   │   ├── Login.jsx            # Authentication component
│   │   ├── Menu.jsx             # Navigation menu
│   │   ├── MyPolicies.jsx       # User insurance policies
│   │   ├── Payment.jsx          # Payment processing
│   │   ├── PolicyDetails.jsx    # Policy information
│   │   ├── Quotes.jsx           # Insurance quotes
│   │   └── Notifications.jsx    # User notifications
│   ├── pages/                   # Page-level components
│   ├── assets/                  # Static assets (images, fonts, etc.)
│   ├── App.jsx                  # Main App component
│   ├── App.css                  # Global app styles
│   ├── main.jsx                 # Application entry point
│   └── index.css                # Global styles
├── public/                      # Publicly accessible static files
├── .env.example                 # Example environment variables
├── package.json
├── vite.config.js               # Vite configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── postcss.config.js            # PostCSS configuration
└── README.md
```

## Development

### Available Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Create production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint to check code quality |

### Development Server Details

- **Default URL**: `http://localhost:5173`
- **Hot Module Replacement (HMR)**: Enabled by default
- **Source Maps**: Generated for debugging

### Component Structure

Each component typically follows this pattern:

```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ComponentName() {
  const [state, setState] = useState(null);
  
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    // Component logic
  }, []);

  return (
    <div>
      {/* Component JSX */}
    </div>
  );
}
```

### API Integration

All API calls use axios with the backend base URL:

```javascript
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

// Example: Send OTP
const sendOtp = async (email) => {
  try {
    const response = await axios.post(`${apiUrl}/api/auth/send-otp`, {
      email
    });
    return response.data;
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Styling with Tailwind CSS

The project uses Tailwind CSS for styling:

```jsx
<div className="bg-blue-500 text-white p-4 rounded-lg shadow-md">
  Hello World
</div>
```

## Building for Production

### 1. Create Production Build

```bash
npm run build
```

This creates an optimized build in the `dist/` directory.

### 2. Build Output

The build includes:
- Minified JavaScript and CSS
- Optimized images
- Source maps (optional)
- Static assets

### 3. Deployment

Deploy the contents of the `dist/` directory to your hosting service:

**Popular Hosting Options:**
- Vercel (recommended for Vite)
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Azure Static Web Apps

**Example: Deploy to Vercel**
```bash
npm i -g vercel
vercel
```

## Technology Stack

### Core
- **React** 18.2.0 - UI library
- **Vite** 5.0.0 - Build tool and dev server
- **JavaScript (ES Modules)**

### Styling
- **Tailwind CSS** 3.4.0 - Utility-first CSS framework
- **PostCSS** 8.4.0 - CSS transformation
- **Autoprefixer** 10.4.0 - Browser compatibility

### HTTP & State
- **Axios** 1.6.0 - HTTP client for API requests

### Payments
- **Stripe React** 2.4.0 - Stripe integration
- **Stripe.js** 1.46.0 - Stripe client library

### PDF & Export
- **html2canvas** 1.4.1 - Screenshot library
- **jsPDF** 4.1.0 - PDF generation

### Icons
- **react-icons** 4.12.0 - Icon library

### Development
- **ESLint** 8.54.0 - Code quality
- **React Plugin** 7.33.0 - React linting rules
- **Vite React Plugin** 4.2.0 - React support in Vite

## Dependencies

```json
{
  "React": "UI library",
  "Vite": "Build tool and dev server",
  "Tailwind CSS": "Styling framework",
  "Axios": "HTTP client",
  "Stripe": "Payment processing",
  "html2canvas & jsPDF": "Document export",
  "react-icons": "Icon library"
}
```

## Development Notes

### Common Issues and Solutions

**Port Already in Use**
- Vite default port is 5173. If it's in use, specify a different port:
```bash
npm run dev -- --port 3000
```

**Backend API Connection Failed**
- Ensure backend is running on `https://letmbe--fso2a2w.ashydune-d638a33c.westus2.azurecontainerapps.io`
- Check `VITE_API_URL` in `.env.local`
- Check browser console for CORS errors

**Stripe Key Issues**
- Ensure you're using Publishable Key (not Secret Key)
- Use test keys (pk_test_) during development
- Verify key is correctly set in `.env.local`

**Module Not Found Errors**
- Run `npm install` to ensure all dependencies are installed
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`

### Browser DevTools

**Recommended Extensions:**
- React Developer Tools
- Vite DevTools
- Redux DevTools (if using Redux)

## Deployment Checklist

Before deploying to production:

- [ ] Update `VITE_API_URL` to production backend URL
- [ ] Update `VITE_STRIPE_PUBLIC_KEY` to production Stripe key
- [ ] Set `VITE_APP_ENV=production`
- [ ] Run `npm run build` and verify output
- [ ] Test production build with `npm run preview`
- [ ] Run linter: `npm run lint`
- [ ] Clear browser cache and test
- [ ] Test all payment flows with Stripe live mode
- [ ] Test on multiple browsers and devices

## Support

For issues and questions, please check the main project README or contact the development team.

## Additional Resources

- [Vite Documentation](https://vitejs.dev)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Stripe React Integration](https://stripe.com/docs/stripe-js/react)
- [Axios Documentation](https://axios-http.com)
