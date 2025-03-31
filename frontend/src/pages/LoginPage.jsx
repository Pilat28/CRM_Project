import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function LoginPage() {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post('http://127.0.0.1:5000/api/login', {
        username,
        password,
      });

      const token = res.data.access_token;
      login(token); // контекст: зберігає токен + авторизує
      navigate('/dashboard'); // редирект
    } catch (error) {
      console.error("Login error:", error); // для дебагу в консолі
      const message = error.response?.data?.message || "Невідома помилка";
      alert("Помилка входу: " + message);
    }
    
  };

  return (
    <div className="container text-center mt-5" onKeyDown={(e) => e.key === 'Enter' && handleLogin()} tabIndex={0}>
      <h2>🔐 Вхід до системи</h2>
      <div className="form-group my-3">
        <input
          type="text"
          placeholder="Ім'я користувача"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="form-control"
        />
      </div>
      <div className="form-group my-3">
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="form-control"
        />
      </div>
      <button onClick={handleLogin} className="btn btn-primary">Увійти</button>
    </div>
  );
}

export default LoginPage;
