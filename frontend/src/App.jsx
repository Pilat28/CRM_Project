import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import { AuthContext } from './context/AuthContext';

function Navbar() {
  const location = window.location.pathname;
  const { isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isHome = location === '/';

  return (
    <nav className="navbar navbar-expand-lg bg-white shadow-sm px-4 py-3 mb-4">
      <div className="container-fluid d-flex justify-content-between align-items-center">
        <span className="navbar-brand">CRM</span>
        <div className={`d-flex ${isHome ? 'justify-content-center w-100' : ''}`}>
        <NavLink to="/" className="nav-link text-dark">🏠 Головна</NavLink>
          {!isAuthenticated && (
            <NavLink to="/login" className="nav-link text-dark">🔐 Вхід</NavLink>
          )}
          {isAuthenticated && (
            <>
              <NavLink to="/dashboard" className="nav-link text-dark">📊 Кабінет</NavLink>
              <button className="btn btn-sm btn-outline-danger ms-2" onClick={handleLogout}>Вийти</button>
            </>
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
