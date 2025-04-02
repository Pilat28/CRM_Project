import React, { useState } from 'react';

function OrderBuilder() {
  const [orderName, setOrderName] = useState('');
  const [mainQuantity, setMainQuantity] = useState(1);
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', quantity: 1 });

  const addItem = () => {
    if (!newItem.name || newItem.quantity <= 0) return;
    setItems([...items, newItem]);
    setNewItem({ name: '', quantity: 1 });
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
    item.final ?? item.quantity * mainQuantity;

  const handleSubmit = () => {
    const result = items.map((item) => ({
      name: item.name,
      quantity: getComputedQuantity(item)
    }));
    console.log('📦 Готове замовлення:', result);
    alert('Замовлення зібрано. Дивись консоль для деталей.');
    // Тут можна реалізувати axios.post(...) для відправки
  };

  return (
    <div className="mt-5">
      <h4>🧩 Конструктор замовлень</h4>
      <div className="row mb-3">
        <div className="col-md-4">
          <input
            className="form-control"
            placeholder="Назва набору (наприклад: Літаки)"
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
            placeholder="x на 1 набір"
            value={newItem.quantity}
            onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) })}
          />
        </div>
        <div className="col-md-2">
          <button className="btn btn-primary w-100" onClick={addItem}>Додати</button>
        </div>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Компонент</th>
            <th>На 1 набір</th>
            <th>Обчислено x{mainQuantity}</th>
            <th>Фінально</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i}>
              <td>{item.name}</td>
              <td>{item.quantity}</td>
              <td>{item.quantity * mainQuantity}</td>
              <td>
                <input
                  type="number"
                  className="form-control"
                  value={getComputedQuantity(item)}
                  onChange={(e) => updateFinalQuantity(i, e.target.value)}
                />
              </td>
              <td>
                <button className="btn btn-danger btn-sm" onClick={() => removeItem(i)}>✖</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="btn btn-success mt-3" onClick={handleSubmit}>📤 Надіслати замовлення</button>
    </div>
  );
}

export default OrderBuilder;