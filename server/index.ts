import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { db } from "./db";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Create missing database tables on startup
async function ensureDatabaseTables() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS "student_submissions" (
        "id" VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        "homework_id" VARCHAR NOT NULL REFERENCES "homework"("id"),
        "student_id" VARCHAR NOT NULL REFERENCES "users"("id"),
        "file_name" TEXT NOT NULL,
        "original_name" TEXT NOT NULL,
        "file_url" TEXT NOT NULL,
        "file_size" INTEGER NOT NULL,
        "mime_type" VARCHAR NOT NULL,
        "notes" TEXT,
        "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    console.log("✅ Database tables verified/created");
  } catch (error) {
    console.error("❌ Database table creation error:", error);
  }
}

ensureDatabaseTables();

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

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
  try {
    console.log("🚀 Starting server initialization...");
    const server = await registerRoutes(app);
    console.log("✅ Routes registered, setting up Vite...");

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
      throw err;
    });

    // Setup Vite with error handling
    console.log("🔧 Environment:", app.get("env"));
    if (app.get("env") === "development") {
      console.log("⚡ Setting up Vite development server...");
      try {
        await setupVite(app, server);
        console.log("✅ Vite setup completed");
      } catch (error) {
        console.error("❌ Vite setup failed:", error);
        // Fallback to simple serving
        app.get('*', (req, res) => {
          res.json({ message: 'LukaMath API Server (Vite failed)', path: req.path });
        });
      }
    } else {
      console.log("📁 Setting up static file serving...");
      serveStatic(app);
      console.log("✅ Static serving setup completed");
    }

    // ALWAYS serve the app on the port specified in the environment variable PORT
    // Other ports are firewalled. Default to 5000 if not specified.
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = parseInt(process.env.PORT || '5000', 10);
    console.log("🌐 Starting server on port", port);
    server.listen(port, '0.0.0.0', () => {
      console.log(`✅ Server is now running on port ${port}`);
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error);
    process.exit(1);
  }
})();
