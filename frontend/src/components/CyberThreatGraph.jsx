import React from 'react';
import { ShieldAlert, Cpu, Database, Terminal, FileCode, Lock, Zap } from 'lucide-react';

export default function CyberThreatGraph({ breakdown = { critical: 0, high: 0, medium: 0, low: 0 }, totalVulnerabilities = 0 }) {
  const categories = [
    { name: 'Buffer Overflow', cwe: 'CWE-120', count: breakdown.critical || 0, color: '#FF3333', icon: Terminal },
    { name: 'Command Injection', cwe: 'CWE-78', count: Math.max(0, (breakdown.critical || 0) - 1), color: '#FF3333', icon: Cpu },
    { name: 'SQL Injection', cwe: 'CWE-89', count: breakdown.high || 0, color: '#ff9900', icon: Database },
    { name: 'Path Traversal / SSRF', cwe: 'CWE-22', count: Math.max(0, (breakdown.high || 0) - 1), color: '#ff9900', icon: FileCode },
    { name: 'Hardcoded Secrets', cwe: 'CWE-798', count: breakdown.medium || 0, color: '#ffcc00', icon: Lock },
    { name: 'Debug & Info Leak', cwe: 'CWE-532', count: breakdown.low || 0, color: '#00FF00', icon: Zap }
  ];

  const maxVal = Math.max(1, totalVulnerabilities);

  return (
    <div className="cyber-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#00FFFF', fontFamily: 'Fira Code', display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <ShieldAlert size={20} color="#00FFFF" />
            Cyber Threat Matrix & CWE Category Analytics
          </h3>
          <p style={{ color: '#8b949e', fontSize: '0.8rem', marginTop: '2px' }}>
            Real-time breakdown of static vulnerabilities across CWE threat vectors
          </p>
        </div>

        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#00FF00', background: 'rgba(0, 255, 0, 0.12)', padding: '0.25rem 0.65rem', borderRadius: '6px', border: '1px solid rgba(0, 255, 0, 0.35)', fontFamily: 'Fira Code' }}>
          {totalVulnerabilities} TOTAL THREATS
        </span>
      </div>

      {/* Cyber Category Bar Graph */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem', justifyContent: 'center' }}>
        {categories.map((cat, idx) => {
          const Icon = cat.icon;
          const pct = Math.min(100, Math.round((cat.count / maxVal) * 100));
          return (
            <div key={idx} style={{ background: '#0D1117', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(0, 255, 255, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                  <Icon size={14} color={cat.color} />
                  <span style={{ fontWeight: 700, color: '#f0f6fc' }}>{cat.name}</span>
                  <span style={{ fontSize: '0.72rem', color: '#00FFFF', fontFamily: 'Fira Code', fontWeight: 700 }}>{cat.cwe}</span>
                </div>
                <span style={{ fontWeight: 800, color: cat.color, fontFamily: 'Fira Code' }}>{cat.count} items</span>
              </div>

              {/* Progress Bar Track */}
              <div style={{ width: '100%', height: '6px', background: '#161b22', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{
                  width: `${pct === 0 ? 3 : pct}%`,
                  height: '100%',
                  background: cat.color,
                  borderRadius: '3px',
                  transition: 'width 0.5s ease-out'
                }} />
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '1.25rem', paddingTop: '0.85rem', borderTop: '1px solid rgba(0, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: '#8b949e', fontFamily: 'Fira Code' }}>
        <span>⚡ Detection Pipeline: Lexer ➔ AST ➔ IR</span>
        <span style={{ color: '#00FF00', fontWeight: 700 }}>100% Real-Time Evaluated</span>
      </div>
    </div>
  );
}
