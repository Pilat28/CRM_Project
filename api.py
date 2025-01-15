from flask_restful import Resource, Api
from flask import request
from models import db, Component, Order

api = Api()

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


# Додаємо маршрут для OrderAPI
api.add_resource(OrderAPI, '/api/orders')
