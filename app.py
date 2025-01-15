from flask import Flask
from models import db, Component, Order, Defect
from api import api

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///crm.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Ініціалізуємо db з додатком
db.init_app(app)

# ініціалізація API
api.init_app(app)


with app.app_context():
    db.create_all()

@app.route('/')
def home():
    return "CRM Project: Welcome to the Backend!"

if __name__ == '__main__':
    app.run(debug=True)
