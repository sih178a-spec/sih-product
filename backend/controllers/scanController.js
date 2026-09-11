const Scan = require('../models/Scan');
const { getIsConnected, memoryDb } = require('../config/db');

exports.getAllScans = async (req, res) => {
  try {
    let scans = [];
    if (getIsConnected()) {
      scans = await Scan.find().sort({ createdAt: -1 }).limit(20);
    } else {
      scans = memoryDb.scans.slice(0, 20);
    }
    return res.status(200).json({ success: true, count: scans.length, scans });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getScanById = async (req, res) => {
  try {
    const { id } = req.params;
    let scan = null;
    if (getIsConnected()) {
      scan = await Scan.findOne({ scanId: id });
    } else {
      scan = memoryDb.scans.find(s => s.scanId === id);
    }

    if (!scan) return res.status(404).json({ error: 'Scan not found' });
    return res.status(200).json({ success: true, scan });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getDashboardMetrics = async (req, res) => {
  try {
    let scans = [];
    if (getIsConnected()) {
      scans = await Scan.find();
    } else {
      scans = memoryDb.scans;
    }

    const totalScans = scans.length;
    let totalRiskScoreSum = 0;
    let criticalCount = 0;
    let highCount = 0;
    let mediumCount = 0;
    let lowCount = 0;
    let totalVulnerabilities = 0;

    scans.forEach(s => {
      totalRiskScoreSum += s.totalRiskScore || 0;
      if (s.findingCounts) {
        criticalCount += s.findingCounts.critical || 0;
        highCount += s.findingCounts.high || 0;
        mediumCount += s.findingCounts.medium || 0;
        lowCount += s.findingCounts.low || 0;
        totalVulnerabilities += s.findingCounts.total || 0;
      }
    });

    const avgRiskScore = totalScans > 0 ? Math.round(totalRiskScoreSum / totalScans) : 0;
    let globalSecurityStatus = 'LOW';
    if (avgRiskScore >= 76 || criticalCount > 2) globalSecurityStatus = 'CRITICAL';
    else if (avgRiskScore >= 46 || highCount > 5) globalSecurityStatus = 'HIGH';
    else if (avgRiskScore >= 21 || mediumCount > 8) globalSecurityStatus = 'MEDIUM';

    return res.status(200).json({
      success: true,
      metrics: {
        totalScans,
        avgRiskScore,
        globalSecurityStatus,
        totalVulnerabilities,
        severityBreakdown: {
          critical: criticalCount,
          high: highCount,
          medium: mediumCount,
          low: lowCount
        },
        codeHealthIndex: Math.max(0, 100 - avgRiskScore)
      }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
