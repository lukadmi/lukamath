console.log("🧪 Minimal test server starting...");

const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Test server is working!');
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Test server running on port ${PORT}`);
});
