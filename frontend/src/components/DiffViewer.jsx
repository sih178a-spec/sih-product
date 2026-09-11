import React, { useState } from 'react';
import { Check, Copy, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function DiffViewer({ vulnerableCode = '', patchedCode = '', title = 'Code Remediation Preview' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(patchedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="cyber-card" style={{ padding: '0', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        padding: '0.85rem 1.25rem',
        background: '#1a2333',
        borderBottom: '1px solid #1f293d',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f3f4f6' }}>
          {title}
        </h4>
        <button
          onClick={handleCopy}
          className="btn-secondary"
          style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
        >
          {copied ? <Check size={14} color="#22c55e" /> : <Copy size={14} />}
          {copied ? 'Copied Patch!' : 'Copy Secure Code'}
        </button>
      </div>

      {/* Side-by-Side Diff */}
      <div className="grid-2" style={{ gap: 0 }}>
        {/* Vulnerable Code Box */}
        <div style={{ borderRight: '1px solid #1f293d', background: 'rgba(239, 68, 68, 0.03)' }}>
          <div style={{
            padding: '0.5rem 1rem',
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#ef4444',
            fontSize: '0.75rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            borderBottom: '1px solid rgba(239, 68, 68, 0.2)'
          }}>
            <AlertTriangle size={14} />
            VULNERABLE CODE PATTERN
          </div>
          <pre className="code-font" style={{
            padding: '1rem',
            fontSize: '0.85rem',
            color: '#f87171',
            lineHeight: 1.6,
            overflowX: 'auto',
            whiteSpace: 'pre-wrap'
          }}>
            {vulnerableCode || '// No vulnerable code snippet available'}
          </pre>
        </div>

        {/* Patched Code Box */}
        <div style={{ background: 'rgba(34, 197, 94, 0.03)' }}>
          <div style={{
            padding: '0.5rem 1rem',
            background: 'rgba(34, 197, 94, 0.1)',
            color: '#22c55e',
            fontSize: '0.75rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            borderBottom: '1px solid rgba(34, 197, 94, 0.2)'
          }}>
            <ShieldCheck size={14} />
            RECOMMENDED SECURE FIX
          </div>
          <pre className="code-font" style={{
            padding: '1rem',
            fontSize: '0.85rem',
            color: '#4ade80',
            lineHeight: 1.6,
            overflowX: 'auto',
            whiteSpace: 'pre-wrap'
          }}>
            {patchedCode || '// No patch code snippet available'}
          </pre>
        </div>
      </div>
    </div>
  );
}
