import React from 'react';

export default function IRViewer({ instructions = [] }) {
  if (!instructions || instructions.length === 0) {
    return <p style={{ color: '#6b7280' }}>No Intermediate Representation (IR) generated.</p>;
  }

  return (
    <div style={{ background: '#0b0f19', border: '1px solid #1f293d', borderRadius: '8px', overflow: 'hidden' }}>
      <div style={{ padding: '0.75rem 1rem', background: '#111827', borderBottom: '1px solid #1f293d', fontSize: '0.8rem', color: '#9ca3af', fontWeight: 600 }}>
        Lightweight Intermediate Representation (TAC / IR Stream):
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
        <thead>
          <tr style={{ background: '#131b2e', color: '#9ca3af', borderBottom: '1px solid #1f293d', textAlign: 'left' }}>
            <th style={{ padding: '0.5rem 1rem' }}>Line</th>
            <th style={{ padding: '0.5rem 1rem' }}>IR Operator</th>
            <th style={{ padding: '0.5rem 1rem' }}>Argument 1</th>
            <th style={{ padding: '0.5rem 1rem' }}>Argument 2</th>
            <th style={{ padding: '0.5rem 1rem' }}>Generated TAC Instruction</th>
          </tr>
        </thead>
        <tbody>
          {instructions.map((inst, idx) => (
            <tr key={idx} style={{
              borderBottom: '1px solid #1f293d',
              background: inst.op === 'CALL_UNSAFE' ? 'rgba(239, 68, 68, 0.1)' : 'transparent'
            }}>
              <td style={{ padding: '0.5rem 1rem', color: '#6b7280' }}>{inst.line || '-'}</td>
              <td style={{ padding: '0.5rem 1rem', fontWeight: 700, color: inst.op === 'CALL_UNSAFE' ? '#ef4444' : '#00f2fe' }}>
                {inst.op}
              </td>
              <td style={{ padding: '0.5rem 1rem', color: '#e5e7eb' }}>{inst.arg1 || '-'}</td>
              <td style={{ padding: '0.5rem 1rem', color: '#9ca3af' }}>{inst.arg2 || '-'}</td>
              <td className="code-font" style={{ padding: '0.5rem 1rem', color: inst.op === 'CALL_UNSAFE' ? '#f87171' : '#a7f3d0' }}>
                {inst.code}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
