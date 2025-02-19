const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3001;

// Configure CORS to allow all origins and methods
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow all common methods
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true
}));

// Handle preflight requests explicitly
app.options('*', cors());

// Parse JSON bodies with increased limit
app.use(bodyParser.json({
  limit: '50mb'
}));

// Add security headers and CORS headers for all responses
app.use((req, res, next) => {
  // CORS headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Security headers
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  
  // Handle OPTIONS method
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Store received webhooks in memory
let receivedWebhooks = [];

// Root endpoint to verify server is running
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    message: 'Webhook server is running'
  });
});

// Endpoint to receive webhooks
app.post('/api/webhook', (req, res) => {
  console.log('Received webhook:', req.body);
  
  try {
    // Store the webhook
    receivedWebhooks.push({
      timestamp: new Date().toISOString(),
      data: req.body
    });

    // Handle Make.com's transaction format
    const transactions = req.body.transactions || [];
    const processedData = transactions.map(tx => ({
      id: tx.id.toString(),
      category: tx.category.toString(),
      status: 'processed'
    }));

    res.status(200).json({
      status: 'success',
      data: processedData
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(400).json({ 
      status: 'error',
      message: error.message || 'Invalid webhook data'
    });
  }
});

// Endpoint to get webhook history
app.get('/api/webhook/history', (req, res) => {
  res.json(receivedWebhooks);
});

// Endpoint to clear webhook history
app.post('/api/webhook/clear', (req, res) => {
  receivedWebhooks = [];
  res.json({ status: 'success' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
});

// Start server - bind to all network interfaces
app.listen(port, '0.0.0.0', () => {
  console.log(`Webhook server listening on port ${port}`);
  console.log(`Server bound to all network interfaces`);
  console.log(`CORS enabled for all origins`);
});
