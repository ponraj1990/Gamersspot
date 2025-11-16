/**
 * Local development server for API routes
 * This allows testing API endpoints locally before deploying to Vercel
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Import API handlers
import stationsHandler from './api/stations.js';
import invoicesHandler from './api/invoices.js';
import reportsHandler from './api/reports.js';
import cleanupHandler from './api/cleanup.js';

// Convert Vercel-style handlers to Express middleware
const adaptHandler = (handler) => {
  return async (req, res) => {
    // Convert Express req/res to Vercel-style
    const vercelReq = {
      method: req.method,
      body: req.body,
      query: { ...req.query, ...req.params },
      headers: req.headers,
    };
    
    let responseSent = false;
    
    const vercelRes = {
      status: (code) => ({
        json: (data) => {
          if (!responseSent) {
            res.status(code).json(data);
            responseSent = true;
          }
        },
        end: () => {
          if (!responseSent) {
            res.status(code).end();
            responseSent = true;
          }
        },
      }),
      setHeader: (name, value) => {
        res.setHeader(name, value);
      },
      json: (data) => {
        if (!responseSent) {
          res.json(data);
          responseSent = true;
        }
      },
      end: () => {
        if (!responseSent) {
          res.end();
          responseSent = true;
        }
      },
    };
    
    try {
      await handler(vercelReq, vercelRes);
      // If handler didn't send a response, send a default one
      if (!responseSent) {
        res.status(200).end();
      }
    } catch (error) {
      console.error('Handler error:', error);
      if (!responseSent) {
        res.status(500).json({ error: error.message });
      }
    }
  };
};

// API Routes
app.all('/api/stations', adaptHandler(stationsHandler));
app.all('/api/stations/:id', adaptHandler(stationsHandler));
app.all('/api/invoices', adaptHandler(invoicesHandler));
app.all('/api/invoices/:invoiceNumber', adaptHandler(invoicesHandler));
app.all('/api/reports', adaptHandler(reportsHandler));
app.all('/api/cleanup', adaptHandler(cleanupHandler));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Local API server is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Local API server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
  console.log(`\nMake sure to set up your .env.local file with your local PostgreSQL connection string.`);
});

