import React from 'react';

export default function RiskGauge({ score = 0, severity = 'LOW', size = 160 }) {
  const normalizedScore = Math.min(100, Math.max(0, Math.round(score)));
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  let color = '#00FF00'; // Matrix Green for LOW / SAFE
  if (severity === 'CRITICAL' || normalizedScore >= 76) color = '#FF3333'; // Alert Red
  else if (severity === 'HIGH' || normalizedScore >= 46) color = '#ff9900'; // Bright Amber
  else if (severity === 'MEDIUM' || normalizedScore >= 21) color = '#ffcc00'; // Gold

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#161b22"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 0.5s ease-out, stroke 0.3s ease'
            }}
          />
        </svg>

        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span style={{ fontSize: '2.2rem', fontWeight: 800, color: color, fontFamily: 'Fira Code', lineHeight: 1 }}>
            {normalizedScore}
          </span>
          <span style={{ fontSize: '0.68rem', color: '#00FFFF', fontWeight: 800, marginTop: '4px', letterSpacing: '0.05em', fontFamily: 'Fira Code' }}>
            / 100 MAX
          </span>
        </div>
      </div>

      <div style={{
        marginTop: '0.85rem',
        padding: '0.3rem 0.85rem',
        borderRadius: '6px',
        fontSize: '0.75rem',
        fontWeight: 800,
        letterSpacing: '0.05em',
        backgroundColor: `${color}18`,
        color: color,
        border: `1px solid ${color}40`,
        fontFamily: 'Fira Code'
      }}>
        {severity} RISK
      </div>
    </div>
  );
}
