/**
 * Integration Example for Swagger UI
 * 
 * This file shows how to integrate the Swagger/OpenAPI documentation
 * into your Express application.
 * 
 * Copy this pattern into your src/index.js
 */

// ============================================================================
// STEP 1: Add these imports to your src/index.js
// ============================================================================

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import Swagger setup
import setupSwagger from './docs/swaggerSetup.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================================================
// STEP 2: Middleware setup (keep your existing middleware)
// ============================================================================

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================================================
// STEP 3: Health check endpoint
// ============================================================================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ============================================================================
// STEP 4: Setup Swagger documentation (ADD THIS LINE)
// ============================================================================

setupSwagger(app, {
  specPath: './src/docs/swagger.yaml',
  docsPath: '/api-docs',
});

// ============================================================================
// STEP 5: API Routes (keep your existing routes)
// ============================================================================

app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);

// ============================================================================
// STEP 6: Error handling middleware (keep your existing error handlers)
// ============================================================================

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    code: err.code || 'INTERNAL_ERROR',
    timestamp: new Date().toISOString(),
  });
});

// ============================================================================
// STEP 7: Start server
// ============================================================================

app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`✓ Health Check: http://localhost:${PORT}/api/health`);
});

// ============================================================================
// ALTERNATIVE: If you prefer minimal setup
// ============================================================================
// Instead of swaggerSetup.js, use this inline code:
//
// import swaggerUi from 'swagger-ui-express';
// import yaml from 'yaml';
// import fs from 'fs';
//
// const swaggerFile = fs.readFileSync('./src/docs/swagger.yaml', 'utf8');
// const swaggerSpec = yaml.parse(swaggerFile);
//
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// app.get('/api-docs/swagger.json', (req, res) => res.json(swaggerSpec));

// ============================================================================
// REQUIRED: Install dependencies
// ============================================================================
// npm install swagger-ui-express yaml

// ============================================================================
// UPDATE package.json scripts
// ============================================================================
// 
// "scripts": {
//   "start": "node src/index.js",
//   "dev": "nodemon src/index.js"
// }
//
// No additional script needed - Swagger will auto-load with the app

// ============================================================================
// ACCESSING THE DOCUMENTATION
// ============================================================================
// 
// 1. Start the server:
//    npm run dev
//
// 2. Open in browser:
//    http://localhost:5000/api-docs
//
// 3. You can now:
//    - View all endpoints
//    - Try out API calls directly
//    - See request/response examples
//    - Copy curl commands
//
// 4. Additional endpoints:
//    - Swagger JSON: http://localhost:5000/api-docs/swagger.json
//    - Swagger YAML: http://localhost:5000/api-docs/swagger.yaml

// ============================================================================
