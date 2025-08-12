import express from "express";
import { db } from "./db.js";

console.log("🚀 Starting server with database...");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Test routes
app.get('/', (req, res) => {
  res.json({ message: 'LukaMath Server with DB is running!', timestamp: new Date().toISOString() });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Test database route
app.get('/api/db-test', async (req, res) => {
  try {
    const result = await db.execute('SELECT NOW() as current_time');
    res.json({ message: 'Database is working', data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Database error', message: error.message });
  }
});

// Simple static file serving for client
app.use(express.static('client/dist'));

// Catch-all for SPA
app.get('*', (req, res) => {
  res.sendFile('index.html', { root: 'client/dist' });
});

const port = parseInt(process.env.PORT || '5000', 10);

app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Server with database running on port ${port}`);
});
