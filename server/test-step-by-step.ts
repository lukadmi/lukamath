console.log("🧪 Step by step server test...");

console.log("1. Importing express...");
import express, { type Request, Response, NextFunction } from "express";
console.log("✅ Express imported");

console.log("2. Importing registerRoutes...");
import { registerRoutes } from "./routes.js";
console.log("✅ registerRoutes imported");

console.log("3. Importing vite utilities...");
import { setupVite, serveStatic, log } from "./vite.js";
console.log("✅ Vite utilities imported");

console.log("4. Creating express app...");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
console.log("✅ Express app configured");

console.log("5. Starting async setup...");
(async () => {
  try {
    console.log("6. Registering routes...");
    const server = await registerRoutes(app);
    console.log("✅ Routes registered successfully");
    
    console.log("7. Setting up Vite...");
    if (app.get("env") === "development") {
      await setupVite(app, server);
      console.log("✅ Vite setup completed");
    }
    
    console.log("8. Starting server...");
    const port = 5000;
    server.listen(port, () => {
      console.log(`✅ Server running on port ${port}`);
    });
  } catch (error) {
    console.error("❌ Error:", error);
  }
})();
