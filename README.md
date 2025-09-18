# Hossi-911 Healthcare Management System

[![Python](https://img.shields.io/badge/Python-3.12+-blue.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.1+-black.svg)](https://flask.palletsprojects.com/)
[![SQLite](https://img.shields.io/badge/SQLite-3-green.svg)](https://www.sqlite.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A comprehensive, secure, and scalable healthcare management system built with Flask, designed to streamline patient care and administrative workflows across multiple medical branches.

## Features

### **Security & Authentication**
- **JWT-based authentication** with secure token management
- **Role-based access control** (RBAC) for admins, doctors, nurses, and patients
- **Password encryption** using bcrypt hashing
- **Rate limiting** to prevent abuse
- **Data encryption** for sensitive patient information

### **Healthcare Management**
- **Multi-branch support** for county-wide healthcare networks
- **Patient management** with comprehensive medical records
- **Appointment scheduling** and management
- **Branch-specific data isolation** for privacy and compliance
- **Audit logging** for all system activities

### **Technical Excellence**
- **RESTful API** with comprehensive endpoints
- **Database migrations** with Alembic
- **Automated testing** with pytest
- **CI/CD pipeline** with GitHub Actions
- **Comprehensive documentation** with OpenAPI specs

## Quick Start

### Prerequisites
- Python 3.12+
- pip (Python package manager)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/hossi-911.git
   cd hossi-911
   ```

2. **Create virtual environment**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your configuration
   ```

5. **Initialize the database**
   ```bash
   cd backend
   python -c "
   from app import app, db
   with app.app_context():
       db.create_all()
   "
   ```

6. **Seed initial data**
   ```bash
   python -c "
   from app import app, db, Branch, User, Patient, bcrypt
   from datetime import date

   with app.app_context():
       # Create sample branch
       branch = Branch(county='Nairobi', location='Nairobi City', contact='contact@nairobi.hosp.ke', capacity=1000)
       db.session.add(branch)
       db.session.commit()

       # Create admin user
       password_hash = bcrypt.generate_password_hash('admin123').decode('utf-8')
       admin = User(username='admin', password_hash=password_hash, role='admin', branch_id=1)
       db.session.add(admin)
       db.session.commit()
   "
   ```

7. **Start the application**
   ```bash
   python app.py
   ```

The API will be available at `http://localhost:5000`

## API Documentation

### Authentication Endpoints

#### Login
```http
POST /login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Patient Management

#### Get Patients (Admin/Doctor/Nurse only)
```http
GET /patients
Authorization: Bearer <access_token>
```

#### Create Patient (Admin only)
```http
POST /patients
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "username": "john_doe",
  "password": "securepass123",
  "name": "John Doe",
  "dob": "1990-01-01",
  "gender": "M",
  "id_number": "12345678",
  "branch_id": 1,
  "allergies": "Penicillin",
  "medical_history": "Hypertension"
}
```

## Testing

### Run Unit Tests
```bash
cd backend
python -m pytest tests/ -v
```

### API Testing with Postman
1. Import the collection from `docs/openapi.yaml`
2. Set up environment variables for `base_url` and `access_token`
3. Run authentication flow and test endpoints

### Manual Testing
```bash
# Test login
curl -X POST http://localhost:5000/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'

# Test patients endpoint (replace TOKEN)
curl -X GET http://localhost:5000/patients \
  -H "Authorization: Bearer TOKEN"
```

## Project Structure

```
hossi-911/
├── backend/
│   ├── app.py                 # Main Flask application
│   ├── models.py             # Database models
│   ├── migrations/           # Database migrations
│   ├── tests/               # Unit tests
│   └── .env                 # Environment configuration
├── database/
│   ├── migrations/          # SQL migration scripts
│   └── seeds/              # Database seed data
├── docs/
│   ├── erd.mermaid         # Entity Relationship Diagram
│   ├── openapi.yaml        # API documentation
│   └── security_checklist.md # Security guidelines
├── scripts/
│   └── setup_db.sh        # Database setup script
└── README.md
```

## Security Features

- **JWT Authentication** with 1-hour token expiration
- **Password Hashing** using bcrypt
- **Rate Limiting** (200 requests/day, 50/hour)
- **Input Validation** and sanitization
- **SQL Injection Prevention** with SQLAlchemy ORM
- **Audit Logging** for compliance
- **Data Encryption** for sensitive information
- **Role-based Access Control**

## Database Schema

### Core Tables
- **branches** - Healthcare facility locations
- **users** - System users with roles
- **patients** - Patient medical records
- **appointments** - Scheduled appointments
- **audits** - System activity logs

### Relationships
```
branches ||--o{ users : has
users ||--o{ patients : manages
branches ||--o{ appointments : hosts
patients ||--o{ appointments : books
```

## Deployment

### Local Development
```bash
# Start development server
python app.py
```

### Production Deployment
```bash
# Using Gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app

# Using Docker
docker build -t hossi-911 .
docker run -p 5000:5000 hossi-911
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Email: support@hossi911.com
- Issues: [GitHub Issues](https://github.com/your-username/hossi-911/issues)
- Documentation: [API Docs](docs/openapi.yaml)

## Acknowledgments

- Flask framework for the robust web foundation
- SQLAlchemy for powerful ORM capabilities
- JWT for secure authentication
- The healthcare community for inspiration

---

**Built with for healthcare professionals worldwide**

*Transforming healthcare management, one patient at a time.*