import React from 'react';
import { NavLink } from 'react-router-dom';
import { ShieldAlert, LayoutDashboard, Bug, Wrench, Terminal } from 'lucide-react';

export default function Navbar() {
  return (
    <nav style={{
      background: 'rgba(13, 17, 23, 0.95)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(0, 255, 255, 0.25)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '0.85rem 2rem',
      boxShadow: '0 0 25px rgba(0, 255, 255, 0.15)'
    }}>
      <div style={{
        maxWidth: '1350px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Brand Logo & Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #00FFFF 0%, #00FF00 100%)',
            padding: '0.55rem',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0d1117',
            boxShadow: '0 0 20px rgba(0, 255, 255, 0.4)'
          }}>
            <ShieldAlert size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f0f6fc', letterSpacing: '-0.02em' }}>
              JOCKY <span style={{ color: '#00FFFF', textShadow: '0 0 10px rgba(0, 255, 255, 0.5)' }}>CODE DETECTIVE</span>
            </h1>
            <p style={{ fontSize: '0.75rem', color: '#8b949e', fontWeight: 600 }}>
              Static Security Compiler & Risk Engine
            </p>
          </div>
        </div>

        {/* 4 Main Webpages Navigation Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#161b22', padding: '0.35rem', borderRadius: '12px', border: '1px solid rgba(0, 255, 255, 0.25)' }}>
          <NavLink
            to="/"
            end
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '0.85rem',
              fontWeight: 800,
              color: isActive ? '#00FFFF' : '#8b949e',
              background: isActive ? 'rgba(0, 255, 255, 0.15)' : 'transparent',
              border: isActive ? '1px solid rgba(0, 255, 255, 0.4)' : '1px solid transparent',
              boxShadow: isActive ? '0 0 15px rgba(0, 255, 255, 0.25)' : 'none',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            })}
          >
            <LayoutDashboard size={17} />
            Dashboard
          </NavLink>

          <NavLink
            to="/vulnerabilities"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '0.85rem',
              fontWeight: 800,
              color: isActive ? '#00FFFF' : '#8b949e',
              background: isActive ? 'rgba(0, 255, 255, 0.15)' : 'transparent',
              border: isActive ? '1px solid rgba(0, 255, 255, 0.4)' : '1px solid transparent',
              boxShadow: isActive ? '0 0 15px rgba(0, 255, 255, 0.25)' : 'none',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            })}
          >
            <Bug size={17} />
            Vulnerabilities
          </NavLink>

          <NavLink
            to="/solutions"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '0.85rem',
              fontWeight: 800,
              color: isActive ? '#00FFFF' : '#8b949e',
              background: isActive ? 'rgba(0, 255, 255, 0.15)' : 'transparent',
              border: isActive ? '1px solid rgba(0, 255, 255, 0.4)' : '1px solid transparent',
              boxShadow: isActive ? '0 0 15px rgba(0, 255, 255, 0.25)' : 'none',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            })}
          >
            <Wrench size={17} />
            Solutions
          </NavLink>

          <NavLink
            to="/compiler"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '0.85rem',
              fontWeight: 800,
              color: isActive ? '#00FFFF' : '#8b949e',
              background: isActive ? 'rgba(0, 255, 255, 0.15)' : 'transparent',
              border: isActive ? '1px solid rgba(0, 255, 255, 0.4)' : '1px solid transparent',
              boxShadow: isActive ? '0 0 15px rgba(0, 255, 255, 0.25)' : 'none',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            })}
          >
            <Terminal size={17} />
            Compiler Page
          </NavLink>
        </div>

        {/* Engine Status pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.78rem',
          background: 'rgba(0, 255, 0, 0.12)',
          color: '#00FF00',
          padding: '0.35rem 0.85rem',
          borderRadius: '9999px',
          border: '1px solid rgba(0, 255, 0, 0.4)',
          fontWeight: 800,
          boxShadow: '0 0 12px rgba(0, 255, 0, 0.25)'
        }}>
          <span style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            backgroundColor: '#00FF00',
            boxShadow: '0 0 10px #00FF00'
          }} />
          Engine Online
        </div>
      </div>
    </nav>
  );
}
