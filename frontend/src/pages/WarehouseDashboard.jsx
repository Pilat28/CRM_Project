import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode';
import { Navigate } from 'react-router-dom';

function WarehouseDashboard() {
  const { token } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [components, setComponents] = useState([]);
  const [newComponent, setNewComponent] = useState({ name: '', quantity: '' });

  useEffect(() => {
    if (token) {
      const decoded = jwtDecode(token);
      const identity = JSON.parse(decoded.sub);
      setUser(identity);
      fetchComponents();
    }
  }, [token]);

  const fetchComponents = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:5000/api/components', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComponents(res.data);
    } catch (err) {
      console.error('❌ Не вдалося завантажити компоненти:', err);
    }
  };

  const updateQuantity = async (component_id, delta) => {
    let reason = '';
    if (delta < 0) {
      reason = prompt('Вкажіть причину зменшення кількості:');
      if (!reason) return alert('❗ Причина обовʼязкова!');
    } else {
      reason = 'Поповнення складу';
    }

    try {
      await axios.post(
        'http://127.0.0.1:5000/api/inventory/update',
        { id: component_id, delta, reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchComponents();
    } catch (err) {
      alert('Помилка оновлення кількості: ' + (err.response?.data?.message || 'Невідома помилка'));
    }
  };

  const handleAddNewComponent = async () => {
    if (!newComponent.name || !newComponent.quantity) return alert('Введіть назву і кількість');

    try {
      await axios.post(
        'http://127.0.0.1:5000/api/components/add_by_warehouse',
        {
          // component_id: null,
          name: newComponent.name.trim(),
          quantity: parseInt(newComponent.quantity),
          reason: 'Додано вручну зі складу'
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setNewComponent({ name: '', quantity: '' });
      fetchComponents();
    } catch (err) {
      alert('Помилка додавання: ' + (err.response?.data?.message || 'Невідома помилка'));
    }
  };

  if (!token) return <Navigate to="/login" />;
  if (user === null) return null;
  if (user.role !== 'warehouse') return <Navigate to="/" />;

  return (
    <div className="container mt-4">
      <h2>🏭 Склад: Управління компонентами</h2>

      <table className="table">
        <thead>
          <tr>
            <th>Компонент</th>
            <th>Кількість</th>
            <th>Змінити</th>
          </tr>
        </thead>
        <tbody>
          {components.map((c) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.quantity}</td>
              <td>
                <button className="btn btn-success btn-sm me-2" onClick={() => updateQuantity(c.id, 1)}>➕</button>
                <button className="btn btn-danger btn-sm" onClick={() => updateQuantity(c.id, -1)}>➖</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4">
        <h5>➕ Додати нову деталь</h5>
        <div className="row">
          <div className="col-md-4">
            <input
              className="form-control"
              placeholder="Назва"
              value={newComponent.name}
              onChange={(e) => setNewComponent({ ...newComponent, name: e.target.value })}
            />
          </div>
          <div className="col-md-2">
            <input
              className="form-control"
              type="number"
              placeholder="Кількість"
              value={newComponent.quantity}
              onChange={(e) => setNewComponent({ ...newComponent, quantity: e.target.value })}
            />
          </div>
          <div className="col-md-2">
            <button className="btn btn-primary" onClick={handleAddNewComponent}>Додати</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WarehouseDashboard;
