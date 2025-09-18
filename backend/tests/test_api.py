import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import pytest
from app import app, db
from flask_jwt_extended import create_access_token

@pytest.fixture
def client():
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://hospital_user:securepass@localhost/hossi_911'
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
        yield client
        with app.app_context():
            db.drop_all()

def test_login(client):
    # Seed a test user
    with app.app_context():
        from app import User, bcrypt
        password_hash = bcrypt.generate_password_hash('testpass').decode('utf-8')
        user = User(username='testuser', password_hash=password_hash, role='admin')
        db.session.add(user)
        db.session.commit()

    response = client.post('/login', json={'username': 'testuser2', 'password': 'testpass'})
    assert response.status_code == 200
    assert 'access_token' in response.json

def test_unauthorized_access(client):
    response = client.get('/patients')
    assert response.status_code == 401