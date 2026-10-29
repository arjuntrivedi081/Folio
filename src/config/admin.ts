export const ADMIN_CONFIG = {
  username: 'folio_123',
  // SHA-256 hash of password
  passwordHash:
    'f4f6917e3cf6cc9767c6d63233d66aad56a3bae4b606c704e6768224a57f95aa',
  sessionKey: 'folio_admin_session_v1',
  sessionDurationDays: 30,
  lockoutKey: 'folio_admin_lockout_v1',
  maxFailedAttempts: 5,
  lockoutDurationSeconds: 30,
  verificationDelayMs: 600,
} as const;
