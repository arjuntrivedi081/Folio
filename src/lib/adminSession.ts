import { useState, useEffect, useCallback } from 'react';
import { ADMIN_CONFIG } from '../config/admin';

interface StoredSession {
  username: string;
  expiresAt: number;
}

interface StoredLockout {
  attempts: number;
  lockedUntil: number;
}

const SESSION_CHANGE_EVENT = 'folio:admin_session_change';

export async function hashPassword(plainPassword: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(plainPassword);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function isSessionActive(): boolean {
  try {
    const raw = localStorage.getItem(ADMIN_CONFIG.sessionKey);
    if (!raw) return false;
    const session: StoredSession = JSON.parse(raw);
    if (!session || typeof session.expiresAt !== 'number') {
      localStorage.removeItem(ADMIN_CONFIG.sessionKey);
      return false;
    }
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem(ADMIN_CONFIG.sessionKey);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function setAdminSession(): void {
  try {
    const expiresAt =
      Date.now() + ADMIN_CONFIG.sessionDurationDays * 24 * 60 * 60 * 1000;
    const session: StoredSession = {
      username: ADMIN_CONFIG.username,
      expiresAt,
    };
    localStorage.setItem(ADMIN_CONFIG.sessionKey, JSON.stringify(session));
    window.dispatchEvent(new Event(SESSION_CHANGE_EVENT));
  } catch {
    // Non-blocking
  }
}

export function clearAdminSession(): void {
  try {
    localStorage.removeItem(ADMIN_CONFIG.sessionKey);
    window.dispatchEvent(new Event(SESSION_CHANGE_EVENT));
  } catch {
    // Non-blocking
  }
}

export function getLockoutInfo(): { isLocked: boolean; secondsRemaining: number } {
  try {
    const raw = localStorage.getItem(ADMIN_CONFIG.lockoutKey);
    if (!raw) return { isLocked: false, secondsRemaining: 0 };
    const lockout: StoredLockout = JSON.parse(raw);
    const now = Date.now();
    if (lockout.lockedUntil && now < lockout.lockedUntil) {
      const remaining = Math.max(1, Math.ceil((lockout.lockedUntil - now) / 1000));
      return { isLocked: true, secondsRemaining: remaining };
    }
    return { isLocked: false, secondsRemaining: 0 };
  } catch {
    return { isLocked: false, secondsRemaining: 0 };
  }
}

function recordFailedAttempt(): { isLocked: boolean; secondsRemaining: number } {
  try {
    const raw = localStorage.getItem(ADMIN_CONFIG.lockoutKey);
    let lockout: StoredLockout = raw
      ? JSON.parse(raw)
      : { attempts: 0, lockedUntil: 0 };

    // Reset if previous lock expired
    if (lockout.lockedUntil && Date.now() > lockout.lockedUntil) {
      lockout = { attempts: 0, lockedUntil: 0 };
    }

    lockout.attempts = (lockout.attempts || 0) + 1;

    if (lockout.attempts >= ADMIN_CONFIG.maxFailedAttempts) {
      lockout.lockedUntil =
        Date.now() + ADMIN_CONFIG.lockoutDurationSeconds * 1000;
      lockout.attempts = 0;
      localStorage.setItem(ADMIN_CONFIG.lockoutKey, JSON.stringify(lockout));
      return {
        isLocked: true,
        secondsRemaining: ADMIN_CONFIG.lockoutDurationSeconds,
      };
    }

    localStorage.setItem(ADMIN_CONFIG.lockoutKey, JSON.stringify(lockout));
    return { isLocked: false, secondsRemaining: 0 };
  } catch {
    return { isLocked: false, secondsRemaining: 0 };
  }
}

function clearLockout(): void {
  try {
    localStorage.removeItem(ADMIN_CONFIG.lockoutKey);
  } catch {
    // Non-blocking
  }
}

export interface VerifyAdminResult {
  success: boolean;
  errorMessage?: string;
}

export async function verifyAndCreateSession(
  enteredUsername: string,
  enteredPassword: string
): Promise<VerifyAdminResult> {
  const lockout = getLockoutInfo();
  if (lockout.isLocked) {
    return {
      success: false,
      errorMessage: `Too many wrong attempts. Please wait ${lockout.secondsRemaining} seconds before trying again.`,
    };
  }

  // Artificial delay (~600ms) for rate-limiting
  await new Promise((resolve) =>
    setTimeout(resolve, ADMIN_CONFIG.verificationDelayMs)
  );

  const hashedInput = await hashPassword(enteredPassword);

  const usernameMatches =
    enteredUsername.trim() === ADMIN_CONFIG.username;
  const passwordMatches = hashedInput === ADMIN_CONFIG.passwordHash;

  if (usernameMatches && passwordMatches) {
    clearLockout();
    setAdminSession();
    return { success: true };
  }

  const newLockout = recordFailedAttempt();
  if (newLockout.isLocked) {
    return {
      success: false,
      errorMessage: `Too many wrong attempts. Please wait ${newLockout.secondsRemaining} seconds before trying again.`,
    };
  }

  return {
    success: false,
    errorMessage: 'Wrong username or password',
  };
}

export function useAdminSession() {
  const [isAdmin, setIsAdmin] = useState<boolean>(isSessionActive());

  const updateStatus = useCallback(() => {
    setIsAdmin(isSessionActive());
  }, []);

  useEffect(() => {
    updateStatus();

    window.addEventListener(SESSION_CHANGE_EVENT, updateStatus);
    window.addEventListener('storage', updateStatus);

    return () => {
      window.removeEventListener(SESSION_CHANGE_EVENT, updateStatus);
      window.removeEventListener('storage', updateStatus);
    };
  }, [updateStatus]);

  const logout = useCallback(() => {
    clearAdminSession();
    setIsAdmin(false);
  }, []);

  return {
    isAdmin,
    logout,
  };
}
