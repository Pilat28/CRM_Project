import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { Navigate } from 'react-router-dom';


function Dashboard() {
  const { token } = useContext(AuthContext);
  const [role, setRole] = useState(null);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ username: '', password: '', role: '' });
  const [editUserId, setEditUserId] = useState(null);
  const [editForm, setEditForm] = useState({ username: '', password: '', role: '' });


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

  const handleEditUser = async () => {
    try {
      await axios.put('http://127.0.0.1:5000/api/users/edit', {
        id: editUserId,
        ...editForm,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEditUserId(null);
      setEditForm({ username: '', password: '', role: '' });
      fetchUsers();
    } catch (err) {
      alert('Помилка редагування користувача: ' + err.response?.data?.message);
    }
  };
  


if (!token) return <Navigate to="/login" />;
if (role === 'admin') return <Navigate to="/admin" />;
if (role === 'warehouse') return <Navigate to="/warehouse" />;
if (role === 'production') return <Navigate to="/production" />;
if (role === 'director') return <Navigate to="/director" />;

return <p>🔒 Невідома роль або немає доступу.</p>;

}

export default Dashboard;
