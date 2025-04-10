from app import app
from models import db, User
from werkzeug.security import generate_password_hash

with app.app_context():
    # Додати лише якщо користувачів ще немає
    if not User.query.filter_by(username="admin").first():
        admin = User(
            username="admin",
            password=generate_password_hash("admin123"),  # пароль можна змінити
            role="admin"
        )
        
        db.session.add(admin)
        db.session.commit()
        print("🟢 Демо-користувачі створені")
    else:
        print("ℹ️ Користувачі вже існують")
