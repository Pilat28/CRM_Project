from flask_restful import Resource, Api
from flask import request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import db, User, Component, Order
from functools import wraps
from werkzeug.security import generate_password_hash

api = Api()


def role_required(role):
    def decorator(func):
        @wraps(func)
        @jwt_required()
        def wrapper(*args, **kwargs):
            current_user = get_jwt_identity()
            if current_user['role'] != role:
                return jsonify({"message": "Доступ заборонено"}), 403
            return func(*args, **kwargs)
        return wrapper
    return decorator

class AdminOnlyRoute(Resource):
    @role_required('admin')
    def get(self):
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


class UserRegistration(Resource):
    def post(self):
        data = request.json
        
        # Хешуємо пароль
        from werkzeug.security import generate_password_hash
        hashed_password = generate_password_hash(data['password'], method='pbkdf2:sha256')
        
        # Створюємо нового користувача
        new_user = User(username=data['username'], password=hashed_password, role=data['role'])
        db.session.add(new_user)
        db.session.commit()
        
        return {"message": "Користувач успішно створений"}, 201

class UserLogin(Resource):
    def post(self):
        data = request.json
        
        # Шукаємо користувача у базі
        user = User.query.filter_by(username=data['username']).first()
        if not user:
            return {"message": "Неправильний логін або пароль"}, 401
        
        # Перевіряємо хешований пароль
        from werkzeug.security import check_password_hash
        if not check_password_hash(user.password, data['password']):
            return {"message": "Неправильний логін або пароль"}, 401
        
        # Генеруємо токен
        access_token = create_access_token(identity={"username": user.username, "role": user.role})
        return {"access_token": access_token}, 200

class ProtectedRoute(Resource):
    @jwt_required()
    def get(self):
        current_user = get_jwt_identity()
        return {"message": f"Ласкаво просимо, {current_user['username']}!"}, 200

class OrderAPI(Resource):
    def get(self):
        """Отримати список усіх замовлень."""
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

    def post(self):
        """Створити нове замовлення."""
        data = request.json

        # Якщо тип замовлення "Літак", автоматично розраховуємо комплектуючі
        if data['order_type'] == "Літак":
            quantity = data['quantity']
            components = []
            base_components = [
                {"name": "Сервоприводи", "quantity": 8},
                {"name": "Камери", "quantity": 2},
                {"name": "Кабанчики", "quantity": 6}
            ]
            for comp in base_components:
                components.append({
                    "name": comp['name'],
                    "quantity": comp['quantity'] * quantity
                })

        # Якщо тип замовлення "Розхідні матеріали", просто беремо список компонентів із запиту
        elif data['order_type'] == "Розхідні матеріали":
            components = data['components']

        else:
            return {"message": "Невідомий тип замовлення"}, 400

        # Створюємо замовлення
        new_order = Order(
            order_type=data['order_type'],
            quantity=data['quantity'],
            components=components,
            status="Очікує"
        )
        db.session.add(new_order)
        db.session.commit()
        return {"message": "Замовлення створено", "id": new_order.id}, 201

    def put(self):
        """Оновити замовлення."""
        data = request.json
        order = Order.query.get(data['id'])
        if not order:
            return {"message": "Замовлення не знайдено"}, 404

        order.quantity = data.get('quantity', order.quantity)
        order.components = data.get('components', order.components)
        order.status = data.get('status', order.status)

        db.session.commit()
        return {"message": "Замовлення оновлено"}, 200

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

# Додаємо маршрут, доступний тільки адміну
class AdminOnlyRoute(Resource):
    @jwt_required()
    def get(self):
        current_user = get_jwt_identity()
        if current_user['role'] != 'admin':
            return {"message": "Доступ заборонено"}, 403

        return {"message": "Ласкаво просимо, адмін!"}, 200


# Додаємо маршрут для OrderAPI
api.add_resource(OrderAPI, '/api/orders')
api.add_resource(UserRegistration, '/api/register')
api.add_resource(UserLogin, '/api/login')
api.add_resource(ProtectedRoute, '/api/protected')
api.add_resource(AdminOnlyRoute, '/api/admin')
api.add_resource(WarehouseRoute, '/api/warehouse')
api.add_resource(ProductionRoute, '/api/production')
api.add_resource(DirectorRoute, '/api/director')