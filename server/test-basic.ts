console.log("🧪 Basic TypeScript test starting...");

import express from "express";

console.log("📦 Express imported successfully");

const app = express();

console.log("🚀 Express app created");

app.get('/', (req, res) => {
  res.json({ message: 'Basic TypeScript server working!' });
});

const port = 5000;

app.listen(port, () => {
  console.log(`✅ Basic server running on port ${port}`);
});
