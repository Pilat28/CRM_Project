import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post('http://127.0.0.1:5000/api/login', { username, password });
      login(res.data.access_token); // Зберігаємо токен в контексті
      navigate('/dashboard');       // Перехід до кабінету
    } catch (err) {
      alert('Помилка входу: ' + err.response?.data?.message || 'Сервер недоступний');
    }
  };

  return (
    <div className="container mt-5">
      <div className="card p-4 shadow">
        <h2 className="mb-3">🔐 Вхід</h2>
        <input
          type="text"
          className="form-control mb-2"
          placeholder="Ім’я користувача"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          className="form-control mb-3"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="btn btn-primary" onClick={handleLogin}>
          Увійти
        </button>
      </div>
    </div>
  );
}

export default LoginPage;
