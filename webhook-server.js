const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3001;

// Configure CORS to allow requests from any origin during development
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(bodyParser.json());

// Store received webhooks in memory
let receivedWebhooks = [];

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    status: 'error',
    message: 'Internal server error'
  });
});

// Endpoint to receive webhooks
app.post('/api/webhook', (req, res) => {
  try {
    console.log('Received webhook:', req.body);
    receivedWebhooks.push({
      timestamp: new Date().toISOString(),
      data: req.body
    });
    res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(400).json({ 
      status: 'error',
      message: 'Invalid webhook data'
    });
  }
});

// Endpoint to get webhook history
app.get('/api/webhook/history', (req, res) => {
  try {
    res.json(receivedWebhooks);
  } catch (error) {
    console.error('Error fetching webhook history:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to fetch webhook history'
    });
  }
});

// Endpoint to clear webhook history
app.post('/api/webhook/clear', (req, res) => {
  try {
    receivedWebhooks = [];
    res.json({ status: 'success' });
  } catch (error) {
    console.error('Error clearing webhook history:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to clear webhook history'
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

app.listen(port, () => {
  console.log(`Webhook server listening at http://localhost:${port}`);
});
