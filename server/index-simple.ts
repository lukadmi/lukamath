import express from "express";

console.log("🚀 Starting simplified server...");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Simple test routes
app.get('/', (req, res) => {
  res.json({ message: 'LukaMath Server is running!', timestamp: new Date().toISOString() });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// Simple static file serving for client
app.use(express.static('client/dist'));

// Catch-all for SPA
app.get('*', (req, res) => {
  res.json({ message: 'SPA route - would serve index.html in production' });
});

const port = parseInt(process.env.PORT || '5000', 10);

app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Simplified server running on port ${port}`);
});
