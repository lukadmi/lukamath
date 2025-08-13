import type { Express } from "express";
import { createServer, type Server } from "http";

export async function registerRoutes(app: Express): Promise<Server> {
  console.log("🔧 Starting minimal route registration...");
  
  // Simple test route to verify basic functionality
  app.get('/api/test', (req, res) => {
    res.json({ 
      message: 'Server is working', 
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV
    });
  });
  
  app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy' });
  });
  
  console.log("✅ Minimal routes setup complete");
  console.log("🌐 Creating HTTP server...");
  const httpServer = createServer(app);
  console.log("✅ Route registration completed successfully");
  return httpServer;
}
