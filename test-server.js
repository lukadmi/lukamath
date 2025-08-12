console.log("Test server starting...");
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello World');
});

const port = 3001;
app.listen(port, () => {
  console.log(`Test server listening on port ${port}`);
});
