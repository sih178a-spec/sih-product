import React, { useEffect, useState } from 'react';
import { Search, Filter, Bug, AlertTriangle, FileCode, ExternalLink, X, ShieldAlert } from 'lucide-react';

export default function Vulnerabilities() {
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVuln, setSelectedVuln] = useState(null);

  useEffect(() => {
    fetchVulnerabilities();
  }, [severityFilter, categoryFilter, searchQuery]);

  const fetchVulnerabilities = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (severityFilter !== 'ALL') params.append('severity', severityFilter);
      if (categoryFilter !== 'ALL') params.append('category', categoryFilter);
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`/api/vulnerabilities?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setVulnerabilities(data.vulnerabilities);
      }
    } catch (err) {
      console.error('Failed to load vulnerabilities:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1350px', margin: '2rem auto', padding: '0 1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Bug color="#00f2fe" size={28} />
          Detailed Vulnerability Intelligence & Findings
        </h2>
        <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Comprehensive catalog of security flaws, CWE classifications, severity vectors, and line-by-line evidence summaries.
        </p>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="cyber-card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Search Bar */}
          <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
            <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
            <input
              type="text"
              placeholder="Search by title, CWE-ID, description, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 0.75rem 0.55rem 2.5rem',
                backgroundColor: '#0b0f19',
                border: '1px solid #1f293d',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '0.875rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Severity Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                style={{
                  padding: '0.4rem 0.8rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  border: '1px solid',
                  borderColor: severityFilter === sev ? '#00f2fe' : '#1f293d',
                  backgroundColor: severityFilter === sev ? 'rgba(0, 242, 254, 0.15)' : '#111827',
                  color: severityFilter === sev ? '#00f2fe' : '#9ca3af',
                  cursor: 'pointer'
                }}
              >
                {sev}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              padding: '0.55rem 0.85rem',
              backgroundColor: '#0b0f19',
              border: '1px solid #1f293d',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '0.85rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="ALL">All Categories</option>
            <option value="Buffer Overflow">Buffer Overflow</option>
            <option value="SQL Injection">SQL Injection</option>
            <option value="Command Injection">Command Injection</option>
            <option value="Cross-Site Scripting">Cross-Site Scripting</option>
            <option value="Hardcoded Secrets">Hardcoded Secrets</option>
            <option value="Insecure Cryptography">Insecure Cryptography</option>
            <option value="Memory Leak">Memory Leak</option>
          </select>
        </div>
      </div>

      {/* Vulnerabilities Table */}
      <div className="cyber-card">
        {loading ? (
          <p style={{ color: '#9ca3af', padding: '1rem' }}>Loading vulnerabilities...</p>
        ) : vulnerabilities.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#9ca3af' }}>
            <ShieldAlert size={40} color="#6b7280" style={{ marginBottom: '0.5rem' }} />
            <p style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff' }}>No matching vulnerabilities found</p>
            <p style={{ fontSize: '0.85rem' }}>Try clearing your search query or filters.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1f293d', color: '#9ca3af', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>CWE ID</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Vulnerability Title</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Category</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Severity</th>
                  <th style={{ padding: '0.75rem 1rem' }}>CVSS Score</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vulnerabilities.map((vuln) => (
                  <tr key={vuln.vulnerabilityId || vuln.title} style={{ borderBottom: '1px solid #1f293d' }}>
                    <td style={{ padding: '0.75rem 1rem', fontFamily: 'Fira Code', fontSize: '0.8rem', color: '#00f2fe', fontWeight: 700 }}>
                      {vuln.cweId}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#ffffff', fontWeight: 600 }}>
                      {vuln.title}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#9ca3af', fontSize: '0.8rem' }}>
                      {vuln.category}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span className={`cyber-badge badge-${(vuln.severity || 'LOW').toLowerCase()}`}>
                        {vuln.severity}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#ffffff' }}>
                      {vuln.cvssScore || 7.5}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <button
                        onClick={() => setSelectedVuln(vuln)}
                        className="btn-secondary"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                      >
                        Inspect Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedVuln && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1.5rem'
        }}>
          <div className="cyber-card" style={{
            maxWidth: '750px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative'
          }}>
            <button
              onClick={() => setSelectedVuln(null)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'transparent',
                border: 'none',
                color: '#9ca3af',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <span className={`cyber-badge badge-${(selectedVuln.severity || 'LOW').toLowerCase()}`}>
                {selectedVuln.severity}
              </span>
              <span style={{ fontFamily: 'Fira Code', color: '#00f2fe', fontWeight: 700, fontSize: '0.85rem' }}>
                {selectedVuln.cweId}
              </span>
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginBottom: '1rem' }}>
              {selectedVuln.title}
            </h3>

            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.85rem', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Description</h4>
              <p style={{ color: '#e5e7eb', fontSize: '0.9rem', lineHeight: 1.6 }}>{selectedVuln.description}</p>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.85rem', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Impact & Attack Vector</h4>
              <p style={{ color: '#ef4444', fontSize: '0.9rem', lineHeight: 1.6 }}>{selectedVuln.impact}</p>
            </div>

            {selectedVuln.vulnerableCode && (
              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.85rem', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Vulnerable Snippet</h4>
                <pre className="code-font" style={{ background: '#0b0f19', padding: '0.85rem', borderRadius: '8px', border: '1px solid #1f293d', color: '#f87171', fontSize: '0.82rem', overflowX: 'auto' }}>
                  {selectedVuln.vulnerableCode}
                </pre>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button onClick={() => setSelectedVuln(null)} className="btn-secondary">
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
