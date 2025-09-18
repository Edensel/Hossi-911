-- Ensure pgcrypto is enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Branches table
CREATE TABLE branches (
    id SERIAL PRIMARY KEY,
    county VARCHAR(50) UNIQUE NOT NULL,
    location VARCHAR(255),
    contact VARCHAR(100),
    capacity INTEGER CHECK (capacity > 0)
);

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(80) UNIQUE NOT NULL,
    password_hash VARCHAR(128) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'doctor', 'nurse', 'patient')),
    branch_id INTEGER REFERENCES branches(id),
    two_fa_secret VARCHAR(255)
);

-- Patients table
CREATE TABLE patients (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id),
    name VARCHAR(100),
    dob DATE,
    gender VARCHAR(10),
    encrypted_id_number BYTEA,
    allergies TEXT,
    medical_history TEXT
);

-- Appointments table
CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id),
    doctor_id INTEGER REFERENCES users(id),
    branch_id INTEGER REFERENCES branches(id),
    appointment_date TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'scheduled'
);

-- Audit logs
CREATE TABLE audits (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(50),
    operation CHAR(1) NOT NULL,
    user_id INTEGER REFERENCES users(id),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    old_data JSONB,
    new_data JSONB
);

-- Audit trigger
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO audits (table_name, operation, user_id, old_data)
        VALUES (TG_RELNAME, 'D', NULL, row_to_json(OLD));
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO audits (table_name, operation, user_id, old_data, new_data)
        VALUES (TG_RELNAME, 'U', NULL, row_to_json(OLD), row_to_json(NEW));
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO audits (table_name, operation, user_id, new_data)
        VALUES (TG_RELNAME, 'I', NULL, row_to_json(NEW));
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER patients_audit
AFTER INSERT OR UPDATE OR DELETE ON patients
FOR EACH ROW EXECUTE FUNCTION audit_trigger();

-- Indexes for performance
CREATE INDEX idx_patients_user_id ON patients(user_id);
CREATE INDEX idx_appointments_branch_id ON appointments(branch_id);

-- Secure view for anonymized data
CREATE VIEW patient_summary AS
SELECT p.id, u.username, p.name, p.dob
FROM patients p JOIN users u ON p.user_id = u.id;