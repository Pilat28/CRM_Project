from flask_restful import Resource, Api
from flask import request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import db, User, Component, Order
from models import InventoryLog
from functools import wraps
from werkzeug.security import generate_password_hash
from flask_jwt_extended import get_jwt
import json


api = Api()


from flask import jsonify

def role_required(role):
    def decorator(func):
        @wraps(func)
        @jwt_required()
        def wrapper(*args, **kwargs):
            identity_raw = get_jwt_identity()
            try:
                identity = json.loads(identity_raw)  # 🟢 декодуємо
            except Exception:
                return {"message": "Помилка обробки токена"}, 400

            user_role = identity.get('role')
            if user_role != role:
                return {"message": "Доступ заборонено"}, 403

            return func(*args, **kwargs)
        return wrapper
    return decorator

class AdminOnlyRoute(Resource):
    @jwt_required()
    def get(self):
        claims = get_jwt()
        if claims.get('role') != 'admin':
            return {"message": "Доступ заборонено"}, 403
        return {"message": "Ласкаво просимо, адмін!"}, 200

class WarehouseRoute(Resource):
    @role_required('warehouse')
    def post(self):
        return {"message": "Доступ до складу дозволено!"}, 200

class ProductionRoute(Resource):
    @role_required('production')
    def get(self):
        return {"message": "Виробництво готове до роботи!"}, 200

class DirectorRoute(Resource):
    @role_required('director')
    def get(self):
        return {"message": "Директор має доступ до перегляду даних!"}, 200

# керування користувачами
class UserManagementAPI(Resource):
    @role_required('admin')  # Тільки адміністратор може виконувати ці дії
    def get(self):
        """Отримати список усіх користувачів."""
        users = User.query.all()
        return [{"id": u.id, "username": u.username, "role": u.role} for u in users], 200

    @role_required('admin')
    def post(self):
        """Додати нового користувача."""
        data = request.json
        if not data.get('username') or not data.get('password') or not data.get('role'):
            return {"message": "Необхідно вказати всі поля: username, password, role"}, 400
        
        # Перевіряємо, чи існує вже такий користувач
        if User.query.filter_by(username=data['username']).first():
            return {"message": "Користувач із таким username вже існує"}, 400
        
        hashed_password = generate_password_hash(data['password'], method='pbkdf2:sha256')
        new_user = User(username=data['username'], password=hashed_password, role=data['role'])
        db.session.add(new_user)
        db.session.commit()
        return {"message": "Користувач створений", "id": new_user.id}, 201

    @role_required('admin')
    def put(self):
        """Редагувати користувача."""
        data = request.json
        user = User.query.get(data['id'])
        if not user:
            return {"message": "Користувача не знайдено"}, 404
        
        user.username = data.get('username', user.username)
        user.role = data.get('role', user.role)
        if data.get('password'):
            user.password = generate_password_hash(data['password'], method='pbkdf2:sha256')
        
        db.session.commit()
        return {"message": "Користувач оновлений"}, 200

    @role_required('admin')
    def delete(self):
        """Видалити користувача."""
        user_id = request.args.get('id')  # Отримуємо ID з параметрів
        user = User.query.get(user_id)
        if not user:
            return {"message": "Користувача не знайдено"}, 404
        
        db.session.delete(user)
        db.session.commit()
        return {"message": "Користувач видалений"}, 200
    
# Редагування користувачів
class UserEdit(Resource):
    @jwt_required()
    @role_required('admin')
    def put(self):
        data = request.json
        user_id = data.get('id')
        if not user_id:
            return {"message": "ID користувача обов'язкове"}, 400

        user = User.query.get(user_id)
        if not user:
            return {"message": "Користувача не знайдено"}, 404

        # Оновлення полів
        user.username = data.get('username', user.username)
        user.role = data.get('role', user.role)
        if data.get('password'):
            user.password = generate_password_hash(data['password'], method='pbkdf2:sha256')
        
        db.session.commit()
        return {"message": "Користувач оновлений"}, 200

# Видалення користувачів
class UserDelete(Resource):
    @jwt_required()
    @role_required('admin')
    def delete(self):
        user_id = request.args.get('id')
        user = User.query.get(user_id)
        if not user:
            return {"message": "Користувача не знайдено"}, 404

        db.session.delete(user)
        db.session.commit()
        return {"message": "Користувач видалений"}, 200

# Реалізація функціоналу звітності
class ReportsAPI(Resource):
    @jwt_required()
    def get(self):
        """Отримати звіт по компонентам і замовленням."""
        identity_json = get_jwt_identity()  # Отримуємо JSON-рядок
        current_user = json.loads(identity_json)  # Перетворюємо на словник

        # Перевіряємо роль користувача
        if current_user.get('role') not in ['admin', 'director']:
            return {"message": "Доступ заборонено"}, 403

        # Статистика по компонентам
        components = Component.query.all()
        components_report = [
            {"name": c.name, "quantity": c.quantity} for c in components
        ]

        # Статистика по замовленням
        total_orders = Order.query.count()
        completed_orders = Order.query.filter_by(status="Завершено").count()
        pending_orders = Order.query.filter(Order.status != "Завершено").count()

        orders_report = {
            "total_orders": total_orders,
            "completed_orders": completed_orders,
            "pending_orders": pending_orders,
        }

        # Повертаємо звіт
        return {
            "message": "Звіт згенеровано успішно",
            "components": components_report,
            "orders": orders_report
        }, 200



# Керування компонентами
class ComponentAPI(Resource):
    @jwt_required()
    def get(self):
        # Отримуємо всі компоненти з бази даних
        components = Component.query.all()
        return [
            {"id": c.id, "name": c.name, "quantity": c.quantity}
            for c in components
        ], 200

    @jwt_required()
    @role_required('admin')  # Доступ лише для адмінів
    def post(self):
        data = request.json
        # Перевіряємо, чи всі дані передано
        if not data.get('name') or not data.get('quantity'):
            return {"message": "Назва та кількість є обов'язковими"}, 400
        
        # Додаємо компонент
        new_component = Component(name=data['name'], quantity=data['quantity'])
        db.session.add(new_component)
        db.session.commit()
        return {"message": "Компонент створено", "id": new_component.id}, 201

    @jwt_required()
    @role_required('admin')
    def put(self):
        data = request.json
        component = Component.query.get(data['id'])
        if not component:
            return {"message": "Компонент не знайдено"}, 404
        
        # Оновлюємо дані компонента
        component.name = data.get('name', component.name)
        component.quantity = data.get('quantity', component.quantity)
        db.session.commit()
        return {"message": "Компонент оновлено"}, 200

    @jwt_required()
    @role_required('admin')
    def delete(self):
        component_id = request.args.get('id')
        if not component_id:
            return {"message": "ID не надано"}, 400
        
        component = Component.query.get(component_id)
        if not component:
            return {"message": "Компонент не знайдено"}, 404

        db.session.delete(component)
        db.session.commit()
        return {"message": "Компонент видалено"}, 200

class ComponentAddByWarehouse(Resource):
    @role_required('warehouse')
    def post(self):
        data = request.get_json()
        name = data.get('name')
        quantity = data.get('quantity')
        user = get_jwt_identity()

        if not name:
            return {"message": "Назва обов'язкова"}, 400

        try:
            quantity = int(quantity)
        except (ValueError, TypeError):
            return {"message": "Кількість має бути числом"}, 400

        component = Component.query.filter(Component.name.ilike(name)).first()

        if component:
            component.quantity += quantity
        else:
            component = Component(name=name, quantity=quantity)
            db.session.add(component)
            db.session.flush()  # Отримаємо ID для логів

        # лог для директора
        log = InventoryLog(
            component_id=component.id,
            quantity_changed=quantity,
            reason="Додавання зі складу",
            modified_by=json.loads(user)['username']
        )
        db.session.add(log)
        db.session.commit()

        return {"message": "Компонент додано або оновлено"}, 200



class InventoryUpdateAPI(Resource):
    @jwt_required()
    @role_required('warehouse')
    def post(self):
        data = request.get_json()
        component_id = data.get('id')
        delta = data.get('delta')
        reason = data.get('reason')
        user = get_jwt_identity()

        if component_id is None or delta is None:
            return {"message": "Невірні дані"}, 400


        component = Component.query.get(component_id)
        if not component:
            return {"message": "Компонент не знайдено"}, 404

        component.quantity += delta

        # логуємо зміну
        log = InventoryLog(
            component_id=component.id,
            quantity_changed=delta,
            reason=reason or "Зміна без причини",
            modified_by=json.loads(user)['username']
        )
        db.session.add(log)
        db.session.commit()

        return {"message": "Кількість оновлена"}, 200


# Додаємо маршрут до API
api.add_resource(UserManagementAPI, '/api/users')



class UserRegistration(Resource):
    def post(self):
        data = request.json
        
        # Перевірка, чи існує користувач із таким ім'ям
        if User.query.filter_by(username=data['username']).first():
            return {"message": "Користувач з таким іменем вже існує"}, 400
        
        # Хешуємо пароль
        from werkzeug.security import generate_password_hash
        hashed_password = generate_password_hash(data['password'], method='pbkdf2:sha256')
        
        # Створюємо нового користувача
        new_user = User(username=data['username'], password=hashed_password, role=data['role'])
        db.session.add(new_user)
        db.session.commit()
        
        return {"message": "Користувач успішно створений"}, 201

from flask import jsonify
from flask_jwt_extended import create_access_token
import json  # Для конвертації словника у рядок

class UserLogin(Resource):
    def post(self):
        data = request.json
        
        # Шукаємо користувача
        user = User.query.filter_by(username=data['username']).first()
        if not user:
            return {"message": "Неправильний логін або пароль"}, 401
        
        # Перевірка пароля
        from werkzeug.security import check_password_hash
        if not check_password_hash(user.password, data['password']):
            return {"message": "Неправильний логін або пароль"}, 401
        
        # Генерація токена з identity у форматі JSON-рядка
        identity = json.dumps({"username": user.username, "role": user.role})
        access_token = create_access_token(identity=identity)
        
        return {"access_token": access_token}, 200
    

class ProtectedRoute(Resource):
    @jwt_required()
    def get(self):
        current_user = get_jwt_identity()
        return {"message": f"Ласкаво просимо, {current_user['username']}!"}, 200

class OrderAPI(Resource):
    @jwt_required()
    def get(self):
        """Отримати список усіх замовлень із фільтрацією за статусом."""
        status_filter = request.args.get('status')  # Фільтр за статусом
        if status_filter:
            orders = Order.query.filter_by(status=status_filter).all()
        else:
            orders = Order.query.all()

        return [
            {
                "id": o.id,
                "order_type": o.order_type,
                "quantity": o.quantity,
                "components": o.components,
                "status": o.status
            } for o in orders
        ], 200

    @jwt_required()
    def post(self):
        """Створити нове замовлення."""
        data = request.json

        if data['order_type'] == "Літак":
            quantity = data['quantity']
            components_needed = [
                {"name": "Сервоприводи", "quantity": 8 * quantity},
                {"name": "Камери", "quantity": 2 * quantity},
                {"name": "Кабанчики", "quantity": 6 * quantity}
            ]

            # Перевіряємо, чи всі компоненти є в достатній кількості
            missing_components = []
            for component in components_needed:
                stock_item = Component.query.filter_by(name=component['name']).first()
                if not stock_item or stock_item.quantity < component['quantity']:
                    missing_quantity = component['quantity'] - (stock_item.quantity if stock_item else 0)
                    missing_components.append({"name": component['name'], "quantity": missing_quantity})

            # Якщо є відсутні компоненти
            if missing_components:
                # Формуємо замовлення на поповнення складу
                new_order = Order(
                    order_type="Складське поповнення",
                    quantity=1,  # Це умовне значення
                    components=missing_components,
                    status="Очікує на поповнення складу"
                )
                db.session.add(new_order)
                db.session.commit()
                return {
                    "message": "Замовлення передано на склад для поповнення компонентів",
                    "missing_components": missing_components,
                    "order_id": new_order.id
                }, 201

            # Якщо всі компоненти є, створюємо замовлення на виробництво
            new_order = Order(
                order_type=data['order_type'],
                quantity=quantity,
                components=components_needed,
                status="Готове до виконання"
            )
            # Зменшуємо кількість компонентів на складі
            for component in components_needed:
                stock_item = Component.query.filter_by(name=component['name']).first()
                if stock_item:
                    stock_item.quantity -= component['quantity']

            db.session.add(new_order)
            db.session.commit()
            return {"message": "Замовлення створено", "id": new_order.id}, 201

        elif data['order_type'] == "Розхідні матеріали":
            components = data['components']

            new_order = Order(
                order_type=data['order_type'],
                quantity=data['quantity'],
                components=components,
                status="Очікує ресурси"
            )
            db.session.add(new_order)
            db.session.commit()
            return {"message": "Замовлення створено", "id": new_order.id}, 201

        else:
            return {"message": "Невідомий тип замовлення"}, 400

    @jwt_required()
    def put(self):
        """Оновити статус замовлення."""
        data = request.json
        order = Order.query.get(data['id'])
        if not order:
            return {"message": "Замовлення не знайдено"}, 404

        # Перевіряємо валідність нового статусу
        valid_statuses = ["Очікує ресурси", "У виробництві", "На перевірці", "Завершено"]
        if data.get('status') not in valid_statuses:
            return {"message": "Невідомий статус"}, 400

        # Оновлюємо статус
        order.status = data['status']
        db.session.commit()
        return {"message": f"Статус замовлення оновлено до '{order.status}'"}, 200

    @role_required('admin')
    def delete(self):
        """Видалити замовлення."""
        order_id = request.args.get('id')  # Отримуємо id з параметрів URL
        if not order_id:
            return {"message": "ID не надано"}, 400

        order = Order.query.get(order_id)
        if not order:
            return {"message": "Замовлення не знайдено"}, 404

        db.session.delete(order)
        db.session.commit()
        return {"message": "Замовлення видалено"}, 200



# Додаємо маршрут для OrderAPI
api.add_resource(OrderAPI, '/api/orders')
api.add_resource(UserRegistration, '/api/register')
api.add_resource(UserLogin, '/api/login')
api.add_resource(ProtectedRoute, '/api/protected')
api.add_resource(AdminOnlyRoute, '/api/admin')
api.add_resource(WarehouseRoute, '/api/warehouse')
api.add_resource(ProductionRoute, '/api/production')
api.add_resource(DirectorRoute, '/api/director')
api.add_resource(ComponentAPI, '/api/components')
api.add_resource(UserEdit, '/api/users/edit')
api.add_resource(UserDelete, '/api/users/delete')
api.add_resource(ReportsAPI, '/api/reports')
api.add_resource(ComponentAddByWarehouse, '/api/components/add_by_warehouse')
api.add_resource(InventoryUpdateAPI, '/api/inventory/update')
