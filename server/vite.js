import express from 'express';
import { createServer as createViteServer } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

export async function setupVite(app, server) {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
    root: join(__dirname, '../client'),
  });

  app.use(vite.middlewares);

  app.use('*', async (req, res, next) => {
    const url = req.originalUrl;

    try {
      let template = fs.readFileSync(join(__dirname, '../client/index.html'), 'utf-8');
      template = await vite.transformIndexHtml(url, template);
      
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}

export function serveStatic(app) {
  const staticPath = join(__dirname, '../dist/public');
  
  if (fs.existsSync(staticPath)) {
    app.use(express.static(staticPath));
    
    app.get('*', (req, res) => {
      res.sendFile(join(staticPath, 'index.html'));
    });
  } else {
    app.get('*', (req, res) => {
      res.status(404).json({ error: 'Build not found. Run npm run build first.' });
    });
  }
} 