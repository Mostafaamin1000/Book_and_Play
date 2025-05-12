// api/vercel-handler.js
import app from './index.js';
import { createServer } from 'http';

export default function handler(req, res) {
  const server = createServer(app);
  return server.emit('request', req, res);
}
