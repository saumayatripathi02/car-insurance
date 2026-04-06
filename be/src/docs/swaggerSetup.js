/**
 * Swagger Configuration
 * 
 * This file sets up Swagger/OpenAPI documentation for the Car Insurance API.
 * 
 * Installation:
 * npm install swagger-ui-express yaml
 * 
 * Usage in src/index.js:
 * import swaggerSetup from './docs/swaggerSetup.js';
 * swaggerSetup(app);
 */

import fs from 'fs';
import path from 'path';
import yaml from 'yaml';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Setup Swagger/OpenAPI documentation
 * @param {Express.Application} app - Express application instance
 * @param {Object} options - Configuration options
 * @param {string} options.specPath - Path to swagger.yaml file
 * @param {string} options.docsPath - Path to serve API docs (default: /api-docs)
 */
export function setupSwagger(app, options = {}) {
  try {
    const specPath = options.specPath || path.join(__dirname, 'swagger.yaml');
    const docsPath = options.docsPath || '/api-docs';

    // Read and parse swagger.yaml
    const swaggerFile = fs.readFileSync(specPath, 'utf8');
    const swaggerSpec = yaml.parse(swaggerFile);

    // Import swagger-ui-express dynamically (optional dependency)
    import('swagger-ui-express').then((module) => {
      const swaggerUi = module.default;

      // Serve Swagger UI
      app.use(
        docsPath,
        swaggerUi.serve,
        swaggerUi.setup(swaggerSpec, {
          explorer: true,
          swaggerOptions: {
            urls: [
              {
                url: `${process.env.API_URL || 'https://letmbe--fso2a2w.ashydune-d638a33c.westus2.azurecontainerapps.io'}/api-docs/swagger.json`,
                name: 'Development',
              },
            ],
            persistAuthorization: true,
            displayOperationId: false,
            filter: true,
            showExtensions: true,
            deepLinking: true,
          },
          customCss: `
            .topbar { display: none; }
            .info .title { padding: 10px; }
          `,
          customSiteTitle: 'Car Insurance API Documentation',
        })
      );

      // Serve swagger.json for API consumption
      app.get('/api-docs/swagger.json', (req, res) => {
        res.json(swaggerSpec);
      });

      // Serve swagger.yaml
      app.get('/api-docs/swagger.yaml', (req, res) => {
        res.type('application/yaml').send(swaggerFile);
      });

      console.log(`✓ Swagger UI available at http://${process.env.API_URL || 'localhost:5000'}${docsPath}`);
    }).catch((error) => {
      console.warn(
        '⚠ Swagger UI not available. Install with: npm install swagger-ui-express yaml\n',
        error.message
      );
    });
  } catch (error) {
    console.error('Error setting up Swagger:', error.message);
  }
}

export default setupSwagger;
