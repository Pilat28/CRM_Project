import axios from 'axios';
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

function OrderBuilder() {
  const { token } = useContext(AuthContext);
  const [orderName, setOrderName] = useState('');
  const [mainQuantity, setMainQuantity] = useState(1);
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', quantity: 1, type: 'set' });
  const [savedTemplates, setSavedTemplates] = useState([]);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:5000/api/templates', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSavedTemplates(res.data);
      } catch (err) {
        console.error('❌ Не вдалося завантажити шаблони:', err);
      }
    };

    if (token) fetchTemplates();
  }, [token]);

  const addItem = () => {
    if (!newItem.name || newItem.quantity <= 0) return;
    setItems([...items, { ...newItem }]);
    setNewItem({ name: '', quantity: 1, type: 'set' });
  };

  const updateFinalQuantity = (index, value) => {
    const updated = [...items];
    updated[index].final = parseInt(value);
    setItems(updated);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const getComputedQuantity = (item) =>
    item.final ?? item.quantity * (item.type === 'set' ? mainQuantity : 1);

  const handleSubmit = async () => {
    const grouped = {
      set: [],
      individual: [],
    };

    items.forEach((item) => {
      const entry = {
        name: item.name,
        quantity: getComputedQuantity(item),
      };
      grouped[item.type === 'set' ? 'set' : 'individual'].push(entry);
    });

    try {
      const res = await axios.post(
        'http://127.0.0.1:5000/api/orders/submit',
        {
          orderName,
          items: [...grouped.set, ...grouped.individual]
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      alert('📦 Замовлення відправлено!');
    } catch (err) {
      console.error('❌ Помилка надсилання замовлення:', err);
      alert('Не вдалося надіслати замовлення.');
    }
  };

  const handleSaveTemplate = async () => {
    if (!orderName || items.length === 0) {
      return alert('❗ Введіть назву та додайте хоча б 1 компонент');
    }

    const payload = { name: orderName, items };

    try {
      const res = await axios.post(
        'http://127.0.0.1:5000/api/templates/upload',
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      alert('✅ Шаблон збережено на сервері!');
    } catch (err) {
      console.error('❌ Помилка відправки:', err);
      alert('❌ Не вдалося зберегти шаблон на сервері.');
    }
  };

  const loadTemplate = (name) => {
    const selected = savedTemplates.find(t => t.name === name);
    if (selected) {
      if (!window.confirm(`Завантажити шаблон "${name}"? Поточні зміни буде втрачено.`)) return;
      setOrderName(selected.name);
      setItems([...selected.items]);
      setMainQuantity(1);
    }
  };

  const deleteTemplate = (name) => {
    if (!window.confirm(`❌ Ви дійсно хочете видалити шаблон "${name}"?`)) return;
    const updated = savedTemplates.filter(t => t.name !== name);
    setSavedTemplates(updated); // локально оновлюємо (але на сервері шаблон залишиться)
  };

  return (
    <div className="mt-5">
      <h4>🧩 Конструктор замовлень</h4>

      {savedTemplates.length > 0 && (
        <div className="mb-3">
          <label className="form-label">📁 Завантажити шаблон:</label>
          <div className="d-flex gap-2 flex-wrap">
            {savedTemplates.map((t, i) => (
              <div key={i} className="btn-group">
                <button className="btn btn-outline-secondary btn-sm" onClick={() => loadTemplate(t.name)}>
                  {t.name}
                </button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => deleteTemplate(t.name)}>×</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="row mb-3">
        <div className="col-md-4">
          <input
            className="form-control"
            placeholder="Назва набору (напр. Літак)"
            value={orderName}
            onChange={(e) => setOrderName(e.target.value)}
          />
        </div>
        <div className="col-md-2">
          <input
            type="number"
            className="form-control"
            placeholder="Кількість"
            value={mainQuantity}
            onChange={(e) => setMainQuantity(parseInt(e.target.value))}
          />
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-4">
          <input
            className="form-control"
            placeholder="Назва компоненту"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
          />
        </div>
        <div className="col-md-2">
          <input
            type="number"
            className="form-control"
            placeholder="x на 1 набір або вручну"
            value={newItem.quantity}
            onChange={(e) =>
              setNewItem({ ...newItem, quantity: parseInt(e.target.value) })
            }
          />
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={newItem.type}
            onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
          >
            <option value="set">В рамках набору</option>
            <option value="individual">Окремий компонент</option>
          </select>
        </div>
        <div className="col-md-3">
          <button className="btn btn-primary w-100" onClick={addItem}>
            ➕ Додати
          </button>
        </div>
      </div>

      <h5>🧱 Набір: <strong>{orderName || 'Не вказано'}</strong> × {mainQuantity}</h5>

      <table className="table">
        <thead>
          <tr>
            <th>Компонент</th>
            <th>Тип</th>
            <th>На 1 набір</th>
            <th>Обчислено</th>
            <th>Фінально</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i}>
              <td>{item.name}</td>
              <td>{item.type === 'set' ? '🔗 з набору' : '🔧 окремо'}</td>
              <td>{item.quantity}</td>
              <td>{getComputedQuantity(item)}</td>
              <td>
                <input
                  type="number"
                  className="form-control"
                  value={getComputedQuantity(item)}
                  onChange={(e) => updateFinalQuantity(i, e.target.value)}
                />
              </td>
              <td>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => removeItem(i)}
                >
                  ❌
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="btn btn-success mt-3" onClick={handleSubmit}>
        📤 Надіслати замовлення
      </button>
      <button className="btn btn-outline-dark mt-3 ms-2" onClick={handleSaveTemplate}>
        💾 Зберегти шаблон
      </button>
    </div>
  );
}

export default OrderBuilder;
