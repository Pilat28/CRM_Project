import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <Router>
      <div style={{
        padding: '2rem',
        fontFamily: 'Arial',
        backgroundColor: '#1e1e1e',
        minHeight: '100vh',
        color: '#fff'
      }}>
        <nav style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          borderBottom: '1px solid #444',
          paddingBottom: '1rem'
        }}>
          <Link to="/" style={{ color: '#4FC3F7', textDecoration: 'none' }}>🏠 Головна</Link>
          <Link to="/login" style={{ color: '#4FC3F7', textDecoration: 'none' }}>🔐 Вхід</Link>
        </nav>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
