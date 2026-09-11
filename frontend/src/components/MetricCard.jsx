import React from 'react';

export default function MetricCard({ title, value, subtitle, icon: Icon, color = '#00FFFF' }) {
  return (
    <div className="cyber-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <span style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {title}
        </span>
        <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', margin: '0.2rem 0' }}>
          {value}
        </h3>
        {subtitle && (
          <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
            {subtitle}
          </p>
        )}
      </div>

      {Icon && (
        <div style={{
          backgroundColor: `${color}15`,
          color: color,
          padding: '0.75rem',
          borderRadius: '12px',
          border: `1px solid ${color}30`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Icon size={26} />
        </div>
      )}
    </div>
  );
}
