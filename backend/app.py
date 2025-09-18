from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_bcrypt import Bcrypt
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from sqlalchemy.exc import SQLAlchemyError
from datetime import timedelta, datetime, date
import os
import logging
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="redis://localhost:6379" if os.getenv('FLASK_DEBUG') != 'True' else None
)

logging.basicConfig(filename='app.log', level=logging.INFO, format='%(asctime)s %(levelname)s : %(message)s')

class Branch(db.Model):
    __tablename__ = 'branches'
    id = db.Column(db.Integer, primary_key=True)
    county = db.Column(db.String(50), unique=True, nullable=False)
    location = db.Column(db.String(255))
    contact = db.Column(db.String(100))
    capacity = db.Column(db.Integer, nullable=False)
    users = db.relationship('User', backref='branch', lazy=True)
    patients = db.relationship('Patient', backref='branch', lazy=True)
    appointments = db.relationship('Appointment', backref='branch', lazy=True)

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), nullable=False)
    branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'))
    two_fa_secret = db.Column(db.String(255))
    audits = db.relationship('Audit', backref='user', lazy=True)

class Patient(db.Model):
    __tablename__ = 'patients'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True)
    branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'))
    name = db.Column(db.String(100))
    dob = db.Column(db.Date)
    gender = db.Column(db.String(10))
    encrypted_id_number = db.Column(db.String(255))
    allergies = db.Column(db.Text)
    medical_history = db.Column(db.Text)
    appointments = db.relationship('Appointment', backref='patient', lazy=True)

class Appointment(db.Model):
    __tablename__ = 'appointments'
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'))
    doctor_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    branch_id = db.Column(db.Integer, db.ForeignKey('branches.id'))
    appointment_date = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(20), default='scheduled')

class Audit(db.Model):
    __tablename__ = 'audits'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    action = db.Column(db.String(100), nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    details = db.Column(db.Text)

def role_required(roles):
    def decorator(f):
        @jwt_required()
        def wrapper(*args, **kwargs):
            identity = get_jwt_identity()
            user = User.query.filter_by(username=identity).first()
            if not user or user.role not in roles:
                return jsonify({"msg": "Access denied"}), 403
            return f(*args, **kwargs)
        wrapper.__name__ = f.__name__
        return wrapper
    return decorator

@app.route('/login', methods=['POST'])
@limiter.limit("5 per minute")
def login():
    data = request.get_json()
    if not data or 'username' not in data or 'password' not in data:
        return jsonify({"msg": "Missing username or password"}), 400
    user = User.query.filter_by(username=data['username']).first()
    if user and bcrypt.check_password_hash(user.password_hash, data['password']):
        token = create_access_token(identity=user.username)
        audit = Audit(user_id=user.id, action="login", details=f"User {user.username} logged in")
        db.session.add(audit)
        db.session.commit()
        logging.info(f"User {user.username} logged in")
        return jsonify(access_token=token)
    return jsonify({"msg": "Invalid credentials"}), 401

@app.route('/patients', methods=['GET'])
@role_required(['admin', 'doctor', 'nurse'])
def get_patients():
    identity = get_jwt_identity()
    user = User.query.filter_by(username=identity).first()
    if user.role == 'admin':
        patients = Patient.query.all()
    else:
        patients = Patient.query.join(User).filter(User.branch_id == user.branch_id).all()
    return jsonify([{
        'id': p.id,
        'name': p.name,
        'dob': p.dob.isoformat() if p.dob else None,
        'gender': p.gender
    } for p in patients])

@app.route('/patients', methods=['POST'])
@role_required(['admin'])
def create_patient():
    data = request.get_json()
    if not data or not all(k in data for k in ['username', 'password', 'name', 'dob', 'gender']):
        return jsonify({"msg": "Missing required fields"}), 400
    try:
        password_hash = bcrypt.generate_password_hash(data['password']).decode('utf-8')
        user = User(
            username=data['username'],
            password_hash=password_hash,
            role='patient',
            branch_id=data.get('branch_id')
        )
        db.session.add(user)
        db.session.flush()
        patient = Patient(
            user_id=user.id,
            name=data['name'],
            dob=date.fromisoformat(data['dob']),
            gender=data['gender'],
            encrypted_id_number=data.get('id_number', ''),
            allergies=data.get('allergies'),
            medical_history=data.get('medical_history')
        )
        db.session.add(patient)
        audit = Audit(
            user_id=User.query.filter_by(username=get_jwt_identity()).first().id,
            action="create_patient",
            details=f"Created patient {data['name']} by {get_jwt_identity()}"
        )
        db.session.add(audit)
        db.session.commit()
        logging.info(f"Created patient {data['name']} by {get_jwt_identity()}")
        return jsonify({"msg": "Patient created", "id": patient.id}), 201
    except SQLAlchemyError as e:
        db.session.rollback()
        logging.error(f"Error creating patient: {str(e)}")
        return jsonify({"error": "Database error"}), 500

@app.route('/branches', methods=['GET'])
@role_required(['admin'])
def get_branches():
    branches = Branch.query.all()
    return jsonify([{
        'id': b.id,
        'county': b.county,
        'location': b.location,
        'contact': b.contact,
        'capacity': b.capacity
    } for b in branches])

@app.route('/branches', methods=['POST'])
@role_required(['admin'])
def create_branch():
    data = request.get_json()
    if not data or not all(k in data for k in ['county', 'location', 'contact', 'capacity']):
        return jsonify({"msg": "Missing required fields"}), 400
    try:
        branch = Branch(
            county=data['county'],
            location=data['location'],
            contact=data['contact'],
            capacity=data['capacity']
        )
        db.session.add(branch)
        audit = Audit(
            user_id=User.query.filter_by(username=get_jwt_identity()).first().id,
            action="create_branch",
            details=f"Created branch {data['county']} by {get_jwt_identity()}"
        )
        db.session.add(audit)
        db.session.commit()
        logging.info(f"Created branch {data['county']} by {get_jwt_identity()}")
        return jsonify({"msg": "Branch created", "id": branch.id}), 201
    except SQLAlchemyError as e:
        db.session.rollback()
        logging.error(f"Error creating branch: {str(e)}")
        return jsonify({"error": "Database error"}), 500

@app.route('/users', methods=['GET'])
@role_required(['admin'])
def get_users():
    users = User.query.all()
    return jsonify([{
        'id': u.id,
        'username': u.username,
        'role': u.role,
        'branch_id': u.branch_id
    } for u in users])

@app.route('/users', methods=['POST'])
@role_required(['admin'])
def create_user():
    data = request.get_json()
    if not data or not all(k in data for k in ['username', 'password', 'role', 'branch_id']):
        return jsonify({"msg": "Missing required fields"}), 400
    try:
        password_hash = bcrypt.generate_password_hash(data['password']).decode('utf-8')
        user = User(
            username=data['username'],
            password_hash=password_hash,
            role=data['role'],
            branch_id=data['branch_id']
        )
        db.session.add(user)
        audit = Audit(
            user_id=User.query.filter_by(username=get_jwt_identity()).first().id,
            action="create_user",
            details=f"Created user {data['username']} by {get_jwt_identity()}"
        )
        db.session.add(audit)
        db.session.commit()
        logging.info(f"Created user {data['username']} by {get_jwt_identity()}")
        return jsonify({"msg": "User created", "id": user.id}), 201
    except SQLAlchemyError as e:
        db.session.rollback()
        logging.error(f"Error creating user: {str(e)}")
        return jsonify({"error": "Database error"}), 500

@app.route('/appointments', methods=['GET'])
@role_required(['admin', 'doctor', 'nurse'])
def get_appointments():
    identity = get_jwt_identity()
    user = User.query.filter_by(username=identity).first()
    if user.role == 'admin':
        appointments = Appointment.query.all()
    else:
        appointments = Appointment.query.filter_by(branch_id=user.branch_id).all()
    return jsonify([{
        'id': a.id,
        'patient_id': a.patient_id,
        'doctor_id': a.doctor_id,
        'branch_id': a.branch_id,
        'appointment_date': a.appointment_date.isoformat(),
        'status': a.status
    } for a in appointments])

@app.route('/appointments', methods=['POST'])
@role_required(['admin', 'doctor', 'nurse'])
def create_appointment():
    data = request.get_json()
    if not data or not all(k in data for k in ['patient_id', 'doctor_id', 'branch_id', 'appointment_date', 'status']):
        return jsonify({"msg": "Missing required fields"}), 400
    try:
        appointment = Appointment(
            patient_id=data['patient_id'],
            doctor_id=data['doctor_id'],
            branch_id=data['branch_id'],
            appointment_date=datetime.fromisoformat(data['appointment_date']),
            status=data['status']
        )
        db.session.add(appointment)
        audit = Audit(
            user_id=User.query.filter_by(username=get_jwt_identity()).first().id,
            action="create_appointment",
            details=f"Created appointment for patient {data['patient_id']} by {get_jwt_identity()}"
        )
        db.session.add(audit)
        db.session.commit()
        logging.info(f"Created appointment for patient {data['patient_id']} by {get_jwt_identity()}")
        return jsonify({"msg": "Appointment created", "id": appointment.id}), 201
    except SQLAlchemyError as e:
        db.session.rollback()
        logging.error(f"Error creating appointment: {str(e)}")
        return jsonify({"error": "Database error"}), 500

@app.route('/audits', methods=['GET'])
@role_required(['admin'])
def get_audits():
    audits = Audit.query.all()
    return jsonify([{
        'id': a.id,
        'user_id': a.user_id,
        'action': a.action,
        'timestamp': a.timestamp.isoformat(),
        'details': a.details
    } for a in audits])

@app.errorhandler(SQLAlchemyError)
def handle_db_error(e):
    logging.error(f"Database error: {str(e)}")
    return jsonify({"error": "Database error"}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=os.getenv('FLASK_DEBUG', False))