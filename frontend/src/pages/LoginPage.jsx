import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // <-- додаємо редирект

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:5000/api/login', {
        username,
        password
      });

      const token = response.data.access_token;
      localStorage.setItem('token', token); // Зберігаємо токен

      alert('Вхід успішний!');
      navigate('/'); // <-- редирект на головну
    } catch (error) {
      alert('Помилка входу: ' + error.response?.data?.message || 'Невідома помилка');
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Login</h1>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ marginRight: '1rem', padding: '0.5rem' }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ marginRight: '1rem', padding: '0.5rem' }}
      />
      <button
        onClick={handleLogin}
        style={{
          backgroundColor: '#4FC3F7',
          border: 'none',
          padding: '0.5rem 1rem',
          cursor: 'pointer'
        }}
      >
        Увійти
      </button>
    </div>
  );
}

export default LoginPage;
