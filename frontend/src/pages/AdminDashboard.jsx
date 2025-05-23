import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

function AdminDashboard() {
  const { token } = useContext(AuthContext);
  const [role, setRole] = useState(null);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ username: '', password: '', role: '' });
  const [editUserId, setEditUserId] = useState(null);
  const [editForm, setEditForm] = useState({ username: '', password: '', role: '' });
  const [components, setComponents] = useState([]);
  const [componentForm, setComponentForm] = useState({ name: '', quantity: 0 });
  const [editComponentId, setEditComponentId] = useState(null);
  const [editComponentForm, setEditComponentForm] = useState({ name: '', quantity: 0 });


  useEffect(() => {
    if (token) {
      const decoded = jwtDecode(token);
      const identity = JSON.parse(decoded.sub);
      setRole(identity.role);

      if (identity.role === 'admin') {
        fetchUsers();
        fetchComponents();
      }
    }
  }, [token]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:5000/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error('Помилка при завантаженні користувачів:', err);
    }
  };

  const handleCreateUser = async () => {
    try {
      await axios.post('http://127.0.0.1:5000/api/users', form, {
        headers: { Authorization: `Bearer ${token}` },
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
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch (err) {
      alert('Помилка видалення користувача: ' + err.response?.data?.message);
    }
  };

  const handleEditUser = async () => {
    try {
      await axios.put('http://127.0.0.1:5000/api/users/edit', {
        id: editUserId,
        ...editForm,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditUserId(null);
      setEditForm({ username: '', password: '', role: '' });
      fetchUsers();
    } catch (err) {
      alert('Помилка редагування користувача: ' + err.response?.data?.message);
    }
  };

  const fetchComponents = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:5000/api/components', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComponents(res.data);
    } catch (err) {
      console.error('Помилка при завантаженні компонентів:', err);
    }
  };
  
  const handleCreateComponent = async () => {
    try {
      await axios.post('http://127.0.0.1:5000/api/components', componentForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComponentForm({ name: '', quantity: 0 });
      fetchComponents();
    } catch (err) {
      alert('Помилка додавання компонента: ' + err.response?.data?.message);
    }
  };
  
  const handleEditComponent = async () => {
    try {
      await axios.put('http://127.0.0.1:5000/api/components', {
        id: editComponentId,
        ...editComponentForm
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditComponentId(null);
      fetchComponents();
    } catch (err) {
      alert('Помилка редагування компонента: ' + err.response?.data?.message);
    }
  };
  
  const handleDeleteComponent = async (id) => {
    if (!window.confirm('Видалити компонент?')) return;
    try {
      await axios.delete(`http://127.0.0.1:5000/api/components?id=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchComponents();
    } catch (err) {
      alert('Помилка видалення: ' + err.response?.data?.message);
    }
  };
  



  return (
    <div className="container">
      <h2 className="mb-4">🔐 Панель адміністратора</h2>
      <p>Тут ви можете керувати користувачами, замовленнями, компонентами, переглядати звіти тощо.</p>

      <h4 className="mt-4">👥 Користувачі системи:</h4>
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
              <td>
                {editUserId === u.id ? (
                  <input
                    className="form-control"
                    value={editForm.username}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  />
                ) : (
                  u.username
                )}
              </td>
              <td>
                {editUserId === u.id ? (
                  <select
                    className="form-select"
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  >
                    <option value="admin">Адмін</option>
                    <option value="warehouse">Склад</option>
                    <option value="production">Виробництво</option>
                    <option value="director">Директор</option>
                  </select>
                ) : (
                  u.role
                )}
              </td>
              <td>
                {editUserId === u.id ? (
                  <>
                    <input
                      type="password"
                      className="form-control mb-1"
                      placeholder="Новий пароль"
                      value={editForm.password}
                      onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                    />
                    <button className="btn btn-sm btn-success me-2" onClick={handleEditUser}>Зберегти</button>
                    <button className="btn btn-sm btn-secondary" onClick={() => setEditUserId(null)}>Скасувати</button>
                  </>
                ) : (
                  <>
                    <button
                      className="btn btn-sm btn-primary me-2"
                      onClick={() => {
                        setEditUserId(u.id);
                        setEditForm({ username: u.username, role: u.role, password: '' });
                      }}
                    >
                      Редагувати
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDeleteUser(u.id)}>Видалити</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>


      <h4 className="mt-5">📦 Компоненти на складі:</h4>

      <table className="table">
      <thead>
          <tr>
          <th>ID</th>
          <th>Назва</th>
          <th>Кількість</th>
          <th>Дії</th>
          </tr>
      </thead>
      <tbody>
          {components.map((c) => (
          <tr key={c.id}>
              <td>{c.id}</td>
              <td>
              {editComponentId === c.id ? (
                  <input
                  className="form-control"
                  value={editComponentForm.name}
                  onChange={(e) => setEditComponentForm({ ...editComponentForm, name: e.target.value })}
                  />
              ) : (
                  c.name
              )}
              </td>
              <td>
              {editComponentId === c.id ? (
                  <input
                  className="form-control"
                  type="number"
                  value={editComponentForm.quantity}
                  onChange={(e) => setEditComponentForm({ ...editComponentForm, quantity: parseInt(e.target.value) })}
                  />
              ) : (
                  c.quantity
              )}
              </td>
              <td>
              {editComponentId === c.id ? (
                  <>
                  <button className="btn btn-sm btn-success me-2" onClick={handleEditComponent}>Зберегти</button>
                  <button className="btn btn-sm btn-secondary" onClick={() => setEditComponentId(null)}>Скасувати</button>
                  </>
              ) : (
                  <>
                  <button
                      className="btn btn-sm btn-primary me-2"
                      onClick={() => {
                      setEditComponentId(c.id);
                      setEditComponentForm({ name: c.name, quantity: c.quantity });
                      }}
                  >
                      Редагувати
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDeleteComponent(c.id)}>Видалити</button>
                  </>
              )}
              </td>
          </tr>
          ))}
      </tbody>
      </table>

      <h5 className="mt-4">➕ Додати новий компонент:</h5>
      <div className="row g-2 my-2">
      <div className="col-md-5">
          <input
          className="form-control"
          placeholder="Назва"
          value={componentForm.name}
          onChange={(e) => setComponentForm({ ...componentForm, name: e.target.value })}
          />
      </div>
      <div className="col-md-4">
          <input
          className="form-control"
          type="number"
          placeholder="Кількість"
          value={componentForm.quantity}
          onChange={(e) => setComponentForm({ ...componentForm, quantity: parseInt(e.target.value) })}
          />
      </div>
      <div className="col-md-3">
          <button className="btn btn-success w-100" onClick={handleCreateComponent}>Додати</button>
      </div>
      </div>



      

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
    </div>
  );
}

export default AdminDashboard;
