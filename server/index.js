import express from "express";
import { registerRoutes } from "./routes.js";
import { setupVite, serveStatic, log } from "./vite.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    console.error('Server error:', err);
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Use port 3000 for Replit compatibility and to avoid macOS conflicts
  const port = process.env.PORT || 3000;
  const host = process.env.HOST || "0.0.0.0";
  
  server.listen({
    port,
    host,
  }, () => {
    log(`🚀 Server running on http://${host}:${port}`);
    log(`📊 Stock Market Simulator v2.0`);
    log(`🔗 AlphaVantage API: Active`);
    log(`⚡ Real-time features: Enabled`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      log(`❌ Port ${port} is already in use. Please try a different port.`);
    } else {
      log(`❌ Server error: ${err.message}`);
    }
    process.exit(1);
  });
})(); 