import { Hono } from 'hono';
import { apiRouter } from './api/routes';
import type { HONO_BINDINGS } from './types';

// Create the main Hono app
const app = new Hono<{ Bindings: HONO_BINDINGS }>();

// Mount the API router
app.route('/api', apiRouter);

// Export for Cloudflare Workers
export default app;