require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;

// Your Xano API base URL from environment variables
const XANO_API_BASE = process.env.XANO_API_BASE_URL;

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // To parse JSON bodies

// This is a proxy endpoint. It catches all requests to /api and forwards them to the Xano backend.
// This is a simple but effective way to hide your Xano URL and manage API calls from one place.
app.all('/api/*', async (req, res) => {
  const path = req.path.replace('/api/', '/api:'); // Adjust path for Xano format
  const url = `${XANO_API_BASE}${path}`;

  try {
    const response = await axios({
      method: req.method,
      url: url,
      data: req.body,
      headers: {
        // Forward the Authorization header from the client, if it exists
        'Authorization': req.headers.authorization || '',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      params: req.query
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    // If the request to Xano fails, forward the error status and message
    const status = error.response ? error.response.status : 500;
    const data = error.response ? error.response.data : { message: 'An internal server error occurred.' };
    res.status(status).json(data);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Export the app for Vercel
module.exports = app;