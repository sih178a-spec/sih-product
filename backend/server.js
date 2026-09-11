const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { connectDB } = require('./config/db');
const { seedInitialData } = require('./seed');

const compilerRoutes = require('./routes/compilerRoutes');
const scanRoutes = require('./routes/scanRoutes');
const vulnerabilityRoutes = require('./routes/vulnerabilityRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initialize DB & Seed Data
connectDB().then(() => {
  seedInitialData();
});

// Routes
app.use('/api/compiler', compilerRoutes);
app.use('/api/scan', scanRoutes);
app.use('/api/vulnerabilities', vulnerabilityRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'Jocky Code Detective Backend',
    timestamp: new Date()
  });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  Jocky Code Detective Backend Server running on port ${PORT}`);
  console.log(`  Health Check: http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);
});
