Security Checklist

Encryption: PII (e.g., id_number) encrypted with pgcrypto using ENCRYPTION_KEY.
Authentication: JWT with 1-hour expiration, bcrypt for passwords.
Authorization: RBAC via role_required decorator, branch_id filtering.
Input Validation: JSON schema checks in API endpoints.
SQL Injection: SQLAlchemy prepared statements.
Rate Limiting: Flask-Limiter (200/day, 50/hour).
Logging: Audit triggers on DB, app logs to app.log.
SSL/TLS: Enforced in production (Render/Neon).
Compliance: Anonymized views (patient_summary), audit logs for Kenya DPA.
OWASP Mitigations: No CSRF (API-only), XSS via input sanitization.
