from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.sqlite import JSON
from datetime import datetime

db = SQLAlchemy()

class Component(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.Integer, default=0)

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_type = db.Column(db.String(50), nullable=False)  # Тип замовлення: "Літак" або "Розхідні матеріали"
    quantity = db.Column(db.Integer, nullable=False)  # Кількість літаків або матеріалів
    components = db.Column(JSON, nullable=False)  # Список компонентів (для літака/матеріалів)
    status = db.Column(db.String(50), default='Очікує')  # Статус замовлення

class Defect(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    component_id = db.Column(db.Integer, db.ForeignKey('component.id'), nullable=False)
    reason = db.Column(db.String(200), nullable=False)
    
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)  # Для хешованих паролів потрібно більше місця
    role = db.Column(db.String(20), nullable=False)

class Template(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    items = db.Column(db.Text, nullable=False)  # JSON-строка

class OrderHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    items = db.Column(db.Text)
    created_by = db.Column(db.String)
