const mongoose = require('mongoose');

const ScanSchema = new mongoose.Schema({
  scanId: { type: String, required: true, unique: true },
  filename: { type: String, default: 'code_sample.cpp' },
  language: { type: String, default: 'cpp' },
  sourceCode: { type: String, required: true },
  totalRiskScore: { type: Number, default: 0 },
  overallRiskSeverity: { type: String, enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'], default: 'LOW' },
  findingCounts: {
    critical: { type: Number, default: 0 },
    high: { type: Number, default: 0 },
    medium: { type: Number, default: 0 },
    low: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  tokens: { type: Array, default: [] },
  ast: { type: Object, default: {} },
  irInstructions: { type: Array, default: [] },
  findings: { type: Array, default: [] },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Scan', ScanSchema);
