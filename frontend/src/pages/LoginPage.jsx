import React, { useState } from 'react';
import axios from 'axios';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:5000/api/login', { username, password });
      alert(`Успішний вхід! Токен: ${response.data.access_token}`);
    } catch (error) {
      alert('Помилка входу: ' + error.response.data.message);
    }
  };

  return (
    <div className="container">
      <div className="card p-4">
        <h2 className="mb-4">🔐 Вхід</h2>
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Ім’я користувача"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <input
            type="password"
            className="form-control"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" onClick={handleLogin}>
          Увійти
        </button>
      </div>
    </div>
  );
}

export default LoginPage;
