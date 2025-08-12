import express from "express";
import path from "path";
import { fileURLToPath } from 'url';

console.log("🚀 Starting LukaMath server...");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Basic API routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/api/auth/user', (req, res) => {
  res.json({ 
    id: 'demo-user', 
    name: 'Demo User', 
    email: 'demo@lukamath.com', 
    role: 'student' 
  });
});

// Serve static files from client build
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientPath = path.join(__dirname, '..', 'client', 'dist');

app.use(express.static(clientPath));

// SPA fallback - serve index.html for all non-API routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    res.status(404).json({ error: 'API endpoint not found' });
  } else {
    const indexPath = path.join(clientPath, 'index.html');
    res.sendFile(indexPath, (err) => {
      if (err) {
        res.status(500).json({ error: 'Failed to serve client' });
      }
    });
  }
});

const port = parseInt(process.env.PORT || '5000', 10);

app.listen(port, '0.0.0.0', () => {
  console.log(`✅ LukaMath server running on http://localhost:${port}`);
  console.log(`📱 Client available at: http://localhost:${port}`);
  console.log(`🔗 API health check: http://localhost:${port}/api/health`);
});
