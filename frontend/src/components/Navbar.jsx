import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode';

function Navbar() {
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  let role = null;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      role = JSON.parse(decoded.sub)?.role;
    } catch (err) {
      console.error('Помилка декодування токена:', err);
    }
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light px-4">
      <Link className="navbar-brand" to="/">ОКБ "Шарашка"</Link>
      <div className="collapse navbar-collapse">
        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
          <li className="nav-item">
            <Link className="nav-link" to="/">Головна</Link>
          </li>

          {!token && (
            <li className="nav-item">
              <Link className="nav-link" to="/login">Увійти</Link>
            </li>
          )}

          {token && role === 'admin' && (
            <li className="nav-item">
              <Link className="nav-link" to="/admin">👤 Адмін</Link>
            </li>
          )}

          {token && role === 'warehouse' && (
            <li className="nav-item">
              <Link className="nav-link" to="/warehouse">🏬 Склад</Link>
            </li>
          )}

          {token && role === 'production' && (
            <li className="nav-item">
              <Link className="nav-link" to="/production">🏭 Виробництво</Link>
            </li>
          )}

          {token && role === 'director' && (
            <li className="nav-item">
              <Link className="nav-link" to="/director">📊 Директор</Link>
            </li>
          )}
        </ul>

        {token && (
          <button className="btn btn-outline-danger" onClick={handleLogout}>Вийти</button>
        )}
        {role === 'admin' && (
          <li className="nav-item">
            <Link className="nav-link" to="/order-builder">🛠 Конструктор замовлень</Link>
          </li>
        )}

      </div>
    </nav>
  );
}

export default Navbar;
