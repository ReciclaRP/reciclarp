import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/logic/backend.js', () => ({
  pullMapData: vi.fn(),
  sendLoginCode: vi.fn(),
  getLoginToken: vi.fn(),
  checkLoginState: vi.fn(),
  createReport: vi.fn(),
}));

import { checkLoginState, getLoginToken, sendLoginCode } from '../src/logic/backend.js';
import {
  invalidateLogin,
  loggedIn,
  login,
  requestLogin,
} from '../src/logic/login.js';
import {
  installCookieJar,
  makeDocument,
  makeWindow,
} from './support/dom.js';

describe('login logic', () => {
  let document;
  let window;
  let cookieWrites;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));

    document = makeDocument();
    cookieWrites = installCookieJar(document).writes;
    window = makeWindow();

    vi.stubGlobal('document', document);
    vi.stubGlobal('window', window);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  describe('invalidateLogin', () => {
    it('clears the login cookies and returns to the home page', () => {
      document.cookie = 'logintok=abc';
      document.cookie = 'loginmail=person@example.com';

      invalidateLogin();

      expect(document.cookie).toBe('');
      expect(window.location.href).toBe('/');
    });
  });

  describe('loggedIn', () => {
    it('returns false when no login cookies are present', async () => {
      await expect(loggedIn()).resolves.toBe(false);
      expect(checkLoginState).not.toHaveBeenCalled();
    });

    it('returns false when only one login cookie is present', async () => {
      document.cookie = 'logintok=abc';

      await expect(loggedIn()).resolves.toBe(false);
      expect(checkLoginState).not.toHaveBeenCalled();
    });

    it('validates the cookies with the API and returns the session', async () => {
      document.cookie = 'theme=dark';
      document.cookie = 'logintok=token-123';
      document.cookie = 'loginmail=person@example.com';
      checkLoginState.mockResolvedValue({ type: 'okay', id: 7 });

      await expect(loggedIn()).resolves.toEqual({
        email: 'person@example.com',
        token: 'token-123',
        data: { type: 'okay', id: 7 },
      });
      expect(checkLoginState).toHaveBeenCalledWith(
        'person@example.com',
        'token-123',
      );
    });

    it('returns false when the API rejects the token', async () => {
      document.cookie = 'logintok=token-123';
      document.cookie = 'loginmail=person@example.com';
      checkLoginState.mockResolvedValue({ type: 'error' });

      await expect(loggedIn()).resolves.toBe(false);
    });

    it('returns false when the API response has no type', async () => {
      document.cookie = 'logintok=token-123';
      document.cookie = 'loginmail=person@example.com';
      checkLoginState.mockResolvedValue(null);

      await expect(loggedIn()).resolves.toBe(false);
    });

    it('propagates API failures', async () => {
      document.cookie = 'logintok=token-123';
      document.cookie = 'loginmail=person@example.com';
      checkLoginState.mockRejectedValue(new Error('offline'));

      await expect(loggedIn()).rejects.toThrow('offline');
    });
  });

  describe('requestLogin', () => {
    it('returns true when the API accepts the e-mail', async () => {
      sendLoginCode.mockResolvedValue({ type: 'okay' });

      await expect(requestLogin('person@example.com')).resolves.toBe(true);
      expect(sendLoginCode).toHaveBeenCalledWith('person@example.com');
    });

    it('returns false when the API refuses the e-mail', async () => {
      sendLoginCode.mockResolvedValue({ type: 'error' });

      await expect(requestLogin('banned@example.com')).resolves.toBe(false);
    });

    it('does not contact the API without an e-mail', async () => {
      await expect(requestLogin('')).resolves.toBe(false);
      expect(sendLoginCode).not.toHaveBeenCalled();
    });

    it('propagates API failures', async () => {
      sendLoginCode.mockRejectedValue(new Error('offline'));

      await expect(requestLogin('person@example.com')).rejects.toThrow('offline');
    });
  });

  describe('login', () => {
    it('stores the token and e-mail for the requested number of days', async () => {
      getLoginToken.mockResolvedValue({ type: 'okay', token: 'token-abc' });

      await expect(login('person@example.com', '12345', 7)).resolves.toBe(true);

      expect(getLoginToken).toHaveBeenCalledWith('person@example.com', '12345');
      expect(document.cookie).toContain('logintok=token-abc');
      expect(document.cookie).toContain('loginmail=person@example.com');
      expect(cookieWrites.some((value) => value.includes('expires='))).toBe(true);
      expect(
        cookieWrites.some((value) =>
          value.includes('Thu, 08 Jan 2026 00:00:00 GMT'),
        ),
      ).toBe(true);
    });

    it('creates a session cookie when days_valid is zero', async () => {
      getLoginToken.mockResolvedValue({ type: 'okay', token: 'token-abc' });

      await expect(login('person@example.com', '12345', 0)).resolves.toBe(true);

      expect(document.cookie).toContain('logintok=token-abc');
      expect(cookieWrites.every((value) => !value.includes('expires='))).toBe(true);
    });

    it('returns false and stores nothing when the code is refused', async () => {
      getLoginToken.mockResolvedValue({ type: 'error' });

      await expect(login('person@example.com', '99999', 7)).resolves.toBe(false);

      expect(document.cookie).toBe('');
    });

    it('does not contact the API without an e-mail and code', async () => {
      await expect(login('', '12345', 7)).resolves.toBe(false);
      await expect(login('person@example.com', '', 7)).resolves.toBe(false);

      expect(getLoginToken).not.toHaveBeenCalled();
    });

    it('returns false for a null API response', async () => {
      getLoginToken.mockResolvedValue(null);

      await expect(login('person@example.com', '12345', 7)).resolves.toBe(false);
    });

    it('propagates API failures', async () => {
      getLoginToken.mockRejectedValue(new Error('offline'));

      await expect(login('person@example.com', '12345', 7)).rejects.toThrow(
        'offline',
      );
    });
  });
});
