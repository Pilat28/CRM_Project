import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <Router>
      <nav className="navbar navbar-expand-lg px-4">
        <div className="d-flex">
          <Link to="/" className="nav-link">
            🏠 Головна
          </Link>
          <Link to="/login" className="nav-link">
            🔐 Вхід
          </Link>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;
