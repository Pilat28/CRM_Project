import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import { AuthContext } from './context/AuthContext';

function Navbar() {
  const { isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg px-4 py-3 bg-white shadow-sm mb-3">
      <div className="container-fluid">
        <Link to="/" className="navbar-brand">CRM</Link>
        <div className="d-flex">
          <Link to="/" className="nav-link">🏠 Головна</Link>
          {!isAuthenticated && <Link to="/login" className="nav-link">🔐 Вхід</Link>}
          {isAuthenticated && <Link to="/dashboard" className="nav-link">📊 Кабінет</Link>}
          {isAuthenticated && (
            <button className="btn btn-sm btn-outline-danger ms-2" onClick={handleLogout}>Вийти</button>
          )}
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
