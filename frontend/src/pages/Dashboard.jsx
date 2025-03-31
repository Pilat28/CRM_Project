import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

function Dashboard() {
  const { token } = useContext(AuthContext);
  const [role, setRole] = useState(null);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ username: '', password: '', role: '' });

  useEffect(() => {
    if (token) {
      const decoded = jwtDecode(token);
      const identity = JSON.parse(decoded.sub);
      setRole(identity.role);

      if (identity.role === 'admin') {
        fetchUsers();
      }
    }
  }, [token]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:5000/api/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(res.data);
    } catch (err) {
      console.error('Помилка при завантаженні користувачів:', err);
    }
  };

  const handleCreateUser = async () => {
    try {
      await axios.post('http://127.0.0.1:5000/api/users', form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchUsers();
      setForm({ username: '', password: '', role: '' });
    } catch (err) {
      alert('Помилка створення користувача: ' + err.response?.data?.message);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Ви впевнені, що хочете видалити користувача?')) return;

    try {
      await axios.delete(`http://127.0.0.1:5000/api/users?id=${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchUsers();
    } catch (err) {
      alert('Помилка видалення користувача: ' + err.response?.data?.message);
    }
  };

  return (
    <div className="container">
      <h2 className="mb-4">📊 Особистий кабінет ({role})</h2>

      {role === 'admin' && (
        <>
          <h4>👥 Користувачі системи:</h4>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Ім’я користувача</th>
                <th>Роль</th>
                <th>Дії</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.username}</td>
                  <td>{u.role}</td>
                  <td>
                    {/* TODO: Кнопка редагування */}
                    <button className="btn btn-sm btn-danger" onClick={() => handleDeleteUser(u.id)}>Видалити</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h5 className="mt-4">➕ Додати нового користувача:</h5>
          <div className="row g-2 my-2">
            <div className="col-md-3">
              <input className="form-control" placeholder="Ім’я" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
            </div>
            <div className="col-md-3">
              <input className="form-control" type="password" placeholder="Пароль" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            <div className="col-md-3">
              <select className="form-select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="">Оберіть роль</option>
                <option value="admin">Адмін</option>
                <option value="warehouse">Склад</option>
                <option value="production">Виробництво</option>
                <option value="director">Директор</option>
              </select>
            </div>
            <div className="col-md-3">
              <button className="btn btn-success w-100" onClick={handleCreateUser}>Створити</button>
            </div>
          </div>
        </>
      )}

      {role !== 'admin' && <p>Тут буде доступ до модулів CRM залежно від вашої ролі.</p>}
    </div>
  );
}

export default Dashboard;
