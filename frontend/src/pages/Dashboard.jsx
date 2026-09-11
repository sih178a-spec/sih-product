import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RiskGauge from '../components/RiskGauge';
import MetricCard from '../components/MetricCard';
import CyberThreatGraph from '../components/CyberThreatGraph';
import { Shield, ShieldAlert, Activity, FileCode, ArrowRight, Play, CheckCircle2, Eye, X, Terminal, Cpu, Bug, Wrench, Zap } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({
    totalScans: 0,
    avgRiskScore: 0,
    globalSecurityStatus: 'LOW',
    totalVulnerabilities: 0,
    severityBreakdown: { critical: 0, high: 0, medium: 0, low: 0 },
    codeHealthIndex: 100
  });
  const [recentScans, setRecentScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedScan, setSelectedScan] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const metricsRes = await fetch('/api/scan/metrics');
      const metricsData = await metricsRes.json();
      if (metricsData.success) {
        setMetrics(metricsData.metrics);
      }

      const scansRes = await fetch('/api/scan');
      const scansData = await scansRes.json();
      if (scansData.success) {
        setRecentScans(scansData.scans);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1350px', margin: '2rem auto', padding: '0 1.5rem' }}>
      {/* Top Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #161b22 0%, #0D1117 100%)',
        border: '1px solid rgba(0, 255, 255, 0.3)',
        borderRadius: '14px',
        padding: '2rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6)'
      }}>
        <div>
          <span style={{ fontSize: '0.78rem', color: '#00FFFF', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'Fira Code', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Zap size={14} color="#00FFFF" />
            REAL-TIME SECURITY ANALYSIS ENGINE
          </span>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#f0f6fc', margin: '0.35rem 0', fontFamily: 'Fira Code', letterSpacing: '-0.02em' }}>
            System Code Posture & Threat Intelligence
          </h2>
          <p style={{ color: '#8b949e', fontSize: '0.9rem', maxWidth: '680px', lineHeight: 1.6 }}>
            Static code analysis powered by custom Lexer, AST Parser, Lightweight Intermediate Representation (IR), and Jocky Risk Scorer.
          </p>
        </div>

        <button
          onClick={() => navigate('/compiler')}
          className="btn-cyber"
          style={{ padding: '0.8rem 1.6rem', fontSize: '0.95rem' }}
        >
          <Play size={18} />
          Start New Code Scan
        </button>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <MetricCard
          title="Global Risk Score"
          value={metrics.avgRiskScore}
          subtitle={`Status: ${metrics.globalSecurityStatus}`}
          icon={ShieldAlert}
          color={metrics.globalSecurityStatus === 'CRITICAL' ? '#FF3333' : metrics.globalSecurityStatus === 'HIGH' ? '#ff9900' : '#00FF00'}
        />
        <MetricCard
          title="Total Scans Executed"
          value={metrics.totalScans}
          subtitle="Analyzed files"
          icon={FileCode}
          color="#00FFFF"
        />
        <MetricCard
          title="Detected Vulnerabilities"
          value={metrics.totalVulnerabilities}
          subtitle={`${metrics.severityBreakdown.critical} Critical, ${metrics.severityBreakdown.high} High`}
          icon={Activity}
          color="#ff9900"
        />
        <MetricCard
          title="Code Health Index"
          value={`${metrics.codeHealthIndex}%`}
          subtitle="Post-scan score"
          icon={CheckCircle2}
          color="#00FF00"
        />
      </div>

      {/* Grid Row 1: Overall Security Posture Gauge + Cyber Threat Analytics Graph */}
      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        {/* Risk Score Gauge & Security KPI Tiles */}
        <div className="cyber-card" style={{ minHeight: '380px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#00FFFF', fontFamily: 'Fira Code', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
              <Shield size={20} color="#00FFFF" />
              Overall Security Posture Gauge
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: '1.5rem', flexWrap: 'wrap' }}>
              <RiskGauge score={metrics.avgRiskScore} severity={metrics.globalSecurityStatus} size={170} />

              {/* Hacker Green & Cyan KPI Quick Stat Tiles */}
              <div style={{ flex: 1, minWidth: '200px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.85rem' }}>
                <div style={{ background: '#0D1117', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255, 51, 51, 0.4)' }}>
                  <span style={{ fontSize: '0.7rem', color: '#FF3333', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'Fira Code' }}>Critical Flaws</span>
                  <h4 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginTop: '2px', fontFamily: 'Fira Code' }}>{metrics.severityBreakdown.critical}</h4>
                </div>

                <div style={{ background: '#0D1117', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255, 153, 0, 0.4)' }}>
                  <span style={{ fontSize: '0.7rem', color: '#ff9900', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'Fira Code' }}>High Risk</span>
                  <h4 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginTop: '2px', fontFamily: 'Fira Code' }}>{metrics.severityBreakdown.high}</h4>
                </div>

                <div style={{ background: '#0D1117', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255, 204, 0, 0.4)' }}>
                  <span style={{ fontSize: '0.7rem', color: '#ffcc00', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'Fira Code' }}>Medium Risk</span>
                  <h4 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginTop: '2px', fontFamily: 'Fira Code' }}>{metrics.severityBreakdown.medium}</h4>
                </div>

                <div style={{ background: '#0D1117', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(0, 255, 0, 0.4)' }}>
                  <span style={{ fontSize: '0.7rem', color: '#00FF00', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'Fira Code' }}>Low / Clean</span>
                  <h4 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginTop: '2px', fontFamily: 'Fira Code' }}>{metrics.severityBreakdown.low}</h4>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.25rem', paddingTop: '0.85rem', borderTop: '1px solid rgba(0, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: '#8b949e', fontFamily: 'Fira Code' }}>
            <span>Code Health Score: <strong style={{ color: '#00FF00' }}>{metrics.codeHealthIndex}%</strong></span>
            <span style={{ color: '#00FFFF', fontWeight: 700 }}>Real-Time Evaluated</span>
          </div>
        </div>

        {/* Visual Cyber Threat Analytics Graph Component */}
        <CyberThreatGraph breakdown={metrics.severityBreakdown} totalVulnerabilities={metrics.totalVulnerabilities} />
      </div>

      {/* Grid Row 2: Action Buttons */}
      <div className="cyber-card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#00f2fe', fontFamily: 'Fira Code', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Cpu size={20} color="#00f2fe" />
          Navigation & Remediation Tools
        </h3>
        <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
          Inspect detailed code vulnerabilities, review automated line-by-line secure solutions, or analyze custom Jocky (.jky) code in real-time.
        </p>

        {/* Cyber Action Card Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
          {/* Button 1 */}
          <div
            onClick={() => navigate('/vulnerabilities')}
            className="cyber-button-card"
            style={{ borderLeftColor: '#ff9900' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ padding: '0.6rem', background: 'rgba(255, 153, 0, 0.15)', borderRadius: '6px', color: '#ff9900', border: '1px solid rgba(255, 153, 0, 0.3)' }}>
                <Bug size={22} />
              </div>
              <div>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#ff9900', letterSpacing: '0.05em', fontFamily: 'Fira Code' }}>CWE CATALOG</span>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc', margin: '2px 0' }}>View Vulnerabilities</h4>
              </div>
            </div>
            <ArrowRight size={18} color="#ff9900" />
          </div>

          {/* Button 2 */}
          <div
            onClick={() => navigate('/solutions')}
            className="cyber-button-card"
            style={{ borderLeftColor: '#00ff66' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ padding: '0.6rem', background: 'rgba(0, 255, 102, 0.15)', borderRadius: '6px', color: '#00ff66', border: '1px solid rgba(0, 255, 102, 0.3)' }}>
                <Wrench size={22} />
              </div>
              <div>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#00ff66', letterSpacing: '0.05em', fontFamily: 'Fira Code' }}>PATCH DIFFS</span>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc', margin: '2px 0' }}>Browse Secure Fixes</h4>
              </div>
            </div>
            <ArrowRight size={18} color="#00ff66" />
          </div>

          {/* Button 3 */}
          <div
            onClick={() => navigate('/compiler')}
            className="cyber-button-card"
            style={{ borderLeftColor: '#00f2fe' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ padding: '0.6rem', background: 'rgba(0, 242, 254, 0.15)', borderRadius: '6px', color: '#00f2fe', border: '1px solid rgba(0, 242, 254, 0.3)' }}>
                <Terminal size={22} />
              </div>
              <div>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#00f2fe', letterSpacing: '0.05em', fontFamily: 'Fira Code' }}>REAL-TIME IR</span>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc', margin: '2px 0' }}>Open Compiler Engine</h4>
              </div>
            </div>
            <ArrowRight size={18} color="#00f2fe" />
          </div>
        </div>

        <div style={{ marginTop: '1.25rem', padding: '0.75rem 1rem', background: '#060a12', borderRadius: '8px', border: '1px solid rgba(0, 242, 254, 0.15)', fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'Fira Code' }}>
          <Cpu size={15} color="#00f2fe" />
          <span>Active Cyber Pipeline: Lexer ➔ AST ➔ TAC IR ➔ Jocky Risk Engine</span>
        </div>
      </div>

      {/* Recent Scans Table (REAL DATA ONLY - NO FAKE DATA) */}
      <div className="cyber-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#00f2fe', fontFamily: 'Fira Code' }}>
              Recent Analysis Scans
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
              Real-time scans performed by you on the Compiler page
            </p>
          </div>
          {recentScans.length > 0 && (
            <span style={{ fontSize: '0.75rem', color: '#00f2fe', fontWeight: 800, padding: '0.3rem 0.75rem', background: 'rgba(0, 242, 254, 0.12)', borderRadius: '6px', border: '1px solid rgba(0, 242, 254, 0.35)', fontFamily: 'Fira Code' }}>
              ⚡ {recentScans.length} Live Records
            </span>
          )}
        </div>

        {loading ? (
          <div style={{ padding: '2rem 0', textAlign: 'center', color: '#94a3b8' }}>
            <Activity className="spin" size={24} style={{ marginBottom: '0.5rem' }} />
            <p>Loading real-time scans...</p>
          </div>
        ) : recentScans.length === 0 ? (
          /* CLEAN EMPTY STATE - NO FAKE DATA */
          <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center', background: '#060a12', borderRadius: '10px', border: '1px border-dashed rgba(0, 242, 254, 0.25)' }}>
            <Terminal size={42} color="#00f2fe" style={{ marginBottom: '1rem' }} />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#00f2fe', marginBottom: '0.5rem', fontFamily: 'Fira Code' }}>
              No Analysis Scans Recorded Yet
            </h4>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', maxWidth: '520px', margin: '0 auto 1.5rem auto', lineHeight: 1.6 }}>
              You have not executed any code analysis scans yet. Head over to the **Compiler & Scanner** page to test .jky code and generate real security audit results!
            </p>
            <button
              onClick={() => navigate('/compiler')}
              className="btn-cyber"
              style={{ padding: '0.75rem 1.5rem' }}
            >
              <Play size={16} />
              Open Compiler & Run First Scan
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(0, 242, 254, 0.2)', color: '#94a3b8', textAlign: 'left', fontFamily: 'Fira Code' }}>
                  <th style={{ padding: '0.85rem 1rem' }}>Scan ID</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Target File</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Language</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Risk Score</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Severity</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Findings</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Timestamp</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentScans.map((scan) => (
                  <tr
                    key={scan.scanId}
                    onClick={() => setSelectedScan(scan)}
                    style={{
                      borderBottom: '1px solid rgba(0, 242, 254, 0.08)',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 242, 254, 0.04)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '0.85rem 1rem', fontFamily: 'Fira Code', fontSize: '0.8rem', color: '#00f2fe', fontWeight: 700 }}>
                      {scan.scanId}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#f8fafc', fontWeight: 600 }}>
                      {scan.filename}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 700, fontFamily: 'Fira Code' }}>
                      {scan.language}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: '#00f2fe', fontFamily: 'Fira Code' }}>
                      {scan.totalRiskScore} / 100
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span className={`cyber-badge badge-${(scan.overallRiskSeverity || 'LOW').toLowerCase()}`}>
                        {scan.overallRiskSeverity}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#94a3b8' }}>
                      {(scan.findings || []).length} items
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#64748b', fontSize: '0.8rem', fontFamily: 'Fira Code' }}>
                      {new Date(scan.createdAt).toLocaleTimeString()}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedScan(scan);
                        }}
                        className="btn-secondary"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                      >
                        <Eye size={13} /> View Pop-up
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* INTERACTIVE POP-UP MODAL FOR SCAN DETAILS */}
      {selectedScan && (
        <div className="modal-backdrop" onClick={() => setSelectedScan(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid rgba(0, 242, 254, 0.2)', paddingBottom: '1rem' }}>
              <div>
                <span className={`cyber-badge badge-${(selectedScan.overallRiskSeverity || 'LOW').toLowerCase()}`}>
                  {selectedScan.overallRiskSeverity} SEVERITY
                </span>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#00f2fe', marginTop: '0.4rem', fontFamily: 'Fira Code' }}>
                  {selectedScan.filename} Analysis Pop-up
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', fontFamily: 'Fira Code' }}>
                  Scan ID: {selectedScan.scanId} | Executed: {new Date(selectedScan.createdAt).toLocaleString()}
                </p>
              </div>

              <button
                onClick={() => setSelectedScan(null)}
                className="btn-secondary"
                style={{ padding: '0.4rem 0.6rem', borderRadius: '50%' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Metrics Quick Header */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem', padding: '1rem', background: '#060a12', borderRadius: '8px', border: '1px solid rgba(0, 242, 254, 0.25)' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, fontFamily: 'Fira Code' }}>Total Risk Score</span>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#00f2fe', fontFamily: 'Fira Code' }}>{selectedScan.totalRiskScore} / 100</h4>
              </div>

              <div>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, fontFamily: 'Fira Code' }}>Tokens / IR Inst</span>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'Fira Code' }}>{(selectedScan.tokens || []).length} / {(selectedScan.irInstructions || []).length}</h4>
              </div>

              <div>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, fontFamily: 'Fira Code' }}>Vulnerabilities</span>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ff0055', fontFamily: 'Fira Code' }}>{(selectedScan.findings || []).length} Items</h4>
              </div>
            </div>

            {/* Detailed Findings List */}
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#00f2fe', marginBottom: '0.75rem', fontFamily: 'Fira Code' }}>
              Detected Vulnerability Details:
            </h4>

            {(selectedScan.findings || []).length === 0 ? (
              <p style={{ color: '#00ff66', padding: '1rem', background: 'rgba(0, 255, 102, 0.1)', borderRadius: '6px', fontFamily: 'Fira Code' }}>
                ✓ No vulnerabilities detected in this scan pass clean!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '320px', overflowY: 'auto' }}>
                {selectedScan.findings.map((f, idx) => (
                  <div key={idx} style={{ padding: '1rem', background: '#060a12', borderRadius: '8px', border: '1px solid rgba(0, 242, 254, 0.15)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className={`cyber-badge badge-${(f.severity || 'LOW').toLowerCase()}`}>
                          {f.severity}
                        </span>
                        <span style={{ fontFamily: 'Fira Code', color: '#00f2fe', fontSize: '0.82rem', fontWeight: 700 }}>
                          {f.cweId}
                        </span>
                        <strong style={{ color: '#f8fafc', fontSize: '0.92rem' }}>{f.title}</strong>
                      </div>
                      <span style={{ fontSize: '0.78rem', color: '#64748b', fontFamily: 'Fira Code' }}>Line {f.lineNumber}</span>
                    </div>

                    <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{f.description}</p>
                    <pre className="code-font" style={{ background: '#0b1220', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', color: '#ff0055', marginBottom: '0.5rem', border: '1px solid rgba(255, 0, 85, 0.3)' }}>
                      {f.codeSnippet}
                    </pre>
                    <p style={{ color: '#00ff66', fontSize: '0.8rem', fontWeight: 600, fontFamily: 'Fira Code' }}>💡 {f.recommendation}</p>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
              <button
                onClick={() => setSelectedScan(null)}
                className="btn-cyber"
                style={{ padding: '0.6rem 1.3rem' }}
              >
                Close Pop-up
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
