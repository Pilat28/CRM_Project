from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from models import db, Component, Order, Defect
from api import api
from flask_cors import CORS
from dotenv import load_dotenv
import os
from flask import request, make_response
from datetime import timedelta

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///crm.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'Pilat_da'  # Замість 'your-secret-key' використовуйте свій ключ
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=2)  # або скільки часу потрібно

CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})


# load_dotenv()
# app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')

db.init_app(app)
migrate = Migrate(app, db)  # Ініціалізація Flask-Migrate
api.init_app(app)

# Налаштовуємо JWT
jwt = JWTManager(app)

with app.app_context():
    db.create_all()

@app.route('/')
def home():
    return "CRM Project: Welcome to the Backend!"

if __name__ == '__main__':
    app.run(debug=True)
