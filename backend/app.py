from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from flask_cors import CORS
from datetime import timedelta, datetime
from models import db, Component, Order, Defect, Template, OrderHistory, InventoryLog
from api import api
import json



app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///crm.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'Pilat_da'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=2)

CORS(app, resources={r"/*": {
    "origins": "*",
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization"]
}}, supports_credentials=True)

db.init_app(app)
migrate = Migrate(app, db)
api.init_app(app)
jwt = JWTManager(app)

@app.route('/')
def home():
    return "CRM Project: Welcome to the Backend!"

# ✅ Збереження шаблону (POST)
@app.route('/api/templates/upload', methods=['POST'])
@jwt_required()
def upload_template():
    data = request.get_json()
    name = data.get('name')
    items = data.get('items')

    if not name or not isinstance(items, list):
        return jsonify({'message': 'Некоректні дані'}), 400

    # Зберігаємо або оновлюємо
    template = Template.query.filter_by(name=name).first()
    if template:
        template.items = json.dumps(items)
    else:
        template = Template(name=name, items=json.dumps(items))
        db.session.add(template)

    db.session.commit()
    return jsonify({'message': 'Шаблон успішно збережено'}), 200

# ✅ Отримання всіх шаблонів (GET)
@app.route('/api/templates', methods=['GET'])
@jwt_required()
def get_templates():
    templates = Template.query.all()
    result = [{'name': t.name, 'items': json.loads(t.items)} for t in templates]
    return jsonify(result), 200

# ✅ Історія замовлень (додатково для звітів)
@app.route('/api/orders/history', methods=['GET'])
@jwt_required()
def get_order_history():
    history = OrderHistory.query.order_by(OrderHistory.timestamp.desc()).all()
    result = [
        {
            'id': h.id,
            'name': h.name,
            'created_by': h.created_by,
            'timestamp': h.timestamp.isoformat(),
            'items': json.loads(h.items)
        } for h in history
    ]
    return jsonify(result), 200

@app.route('/api/orders/submit', methods=['POST'])
@jwt_required()
def submit_order():
    data = request.get_json()
    name = data.get('orderName')
    items = data.get('items')
    user = get_jwt_identity()

    if not name or not isinstance(items, list):
        return jsonify({'message': 'Некоректні дані'}), 400

    order = OrderHistory(name=name, items=json.dumps(items), created_by=user)
    db.session.add(order)
    # Автоматичне зменшення кількості компонентів
    for item in items:
        component = Component.query.filter_by(name=item['name']).first()
        if component:
            if component.quantity >= item['quantity']:
                component.quantity -= item['quantity']
            else:
                return jsonify({'message': f"Недостатньо {component.name} на складі."}), 400
        else:
            return jsonify({'message': f"Компонент {item['name']} не знайдено."}), 404

    db.session.commit()

    return jsonify({'message': 'Замовлення збережено'}), 200

@app.route('/api/orders/my', methods=['GET'])
@jwt_required()
def get_my_orders():
    user = get_jwt_identity()
    history = OrderHistory.query.filter_by(created_by=user).order_by(OrderHistory.timestamp.desc()).all()
    
    result = [
        {
            'id': h.id,
            'name': h.name,
            'created_by': h.created_by,
            'timestamp': h.timestamp.isoformat(),
            'items': json.loads(h.items)
        } for h in history
    ]
    return jsonify(result), 200

# ✅ Отримати всі компоненти зі складу
@app.route('/api/components', methods=['GET'])
@jwt_required()
def get_all_components():
    components = Component.query.all()
    result = [
        {'id': c.id, 'name': c.name, 'quantity': c.quantity}
        for c in components
    ]
    return jsonify(result), 200

@app.route('/api/components/update_quantity', methods=['POST'])
@jwt_required()
def update_component_quantity():
    data = request.get_json()
    component_id = data.get('component_id')
    quantity_change = data.get('quantity_change')
    reason = data.get('reason')
    user = get_jwt_identity()

    if not all([component_id, quantity_change, reason]):
        return jsonify({'message': 'Усі поля обов’язкові.'}), 400

    component = Component.query.get(component_id)
    if not component:
        return jsonify({'message': 'Компонент не знайдено.'}), 404

    component.quantity += quantity_change  # + або -
    log = InventoryLog(
        component_id=component_id,
        quantity_changed=quantity_change,
        reason=reason,
        modified_by=user
    )

    db.session.add(log)
    db.session.commit()

    return jsonify({'message': 'Кількість оновлено.'}), 200

@app.route('/api/inventory/logs', methods=['GET'])
@jwt_required()
def get_inventory_logs():
    user = get_jwt_identity()
    if json.loads(user).get('role') != 'director':
        return jsonify({'message': 'Доступ заборонено'}), 403

    logs = InventoryLog.query.order_by(InventoryLog.timestamp.desc()).all()
    result = [{
        'id': log.id,
        'component_id': log.component_id,
        'quantity_changed': log.quantity_changed,
        'reason': log.reason,
        'timestamp': log.timestamp.isoformat(),
        'modified_by': log.modified_by
    } for log in logs]

    return jsonify(result), 200



if __name__ == '__main__':
    app.run(debug=True)
