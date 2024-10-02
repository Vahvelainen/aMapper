const express = require('express');
const { dirname } = require('path');
const path = require('path')

const app = express();

// Serve static files from the public folder at the root level
app.use(express.static(path.resolve(__dirname, 'public')));

// Route to serve index.html for any non-file request
app.get('/*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

app.listen(process.env.PORT || 4000, () => console.log('Server is doing its thing at http://localhost:4000/'));