import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Vulnerabilities from './pages/Vulnerabilities';
import Solutions from './pages/Solutions';
import CompilerPage from './pages/CompilerPage';

export default function App() {
  return (
    <Router>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0b0f19' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/vulnerabilities" element={<Vulnerabilities />} />
            <Route path="/solutions" element={<Solutions />} />
            <Route path="/compiler" element={<CompilerPage />} />
          </Routes>
        </main>
        
        {/* Footer */}
        <footer style={{
          padding: '1.5rem 2rem',
          borderTop: '1px solid #1f293d',
          textAlign: 'center',
          color: '#6b7280',
          fontSize: '0.8rem',
          background: '#0b0f19'
        }}>
          Jocky Code Detective &copy; {new Date().getFullYear()} - Static Analysis Compiler & Security Risk Scoring Engine (MERN + JS)
        </footer>
      </div>
    </Router>
  );
}
