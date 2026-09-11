import React from 'react';

export default function ASTViewer({ ast }) {
  if (!ast) {
    return <p style={{ color: '#6b7280' }}>No Abstract Syntax Tree (AST) available. Run compiler scan.</p>;
  }

  return (
    <div style={{ background: '#0b0f19', border: '1px solid #1f293d', borderRadius: '8px', padding: '1rem' }}>
      <div style={{ marginBottom: '0.5rem', fontSize: '0.8rem', color: '#9ca3af', fontWeight: 600 }}>
        Abstract Syntax Tree (AST Nodes & Attributes):
      </div>
      <pre className="code-font" style={{
        fontSize: '0.82rem',
        color: '#60a5fa',
        maxHeight: '400px',
        overflow: 'auto',
        lineHeight: 1.5
      }}>
        {JSON.stringify(ast, null, 2)}
      </pre>
    </div>
  );
}
