import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/logic/login.js', () => ({
  loggedIn: vi.fn(),
  invalidateLogin: vi.fn(),
}));

vi.mock('../src/logic/backend.js', () => ({
  getPointAccessesAmount: vi.fn(),
}));

import { getPointAccessesAmount } from '../src/logic/backend.js';
import { invalidateLogin, loggedIn } from '../src/logic/login.js';
import { pointAccessNo } from '../src/logic/points.js';

describe('point access counter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the access count reported by the API for the logged-in user', async () => {
    loggedIn.mockResolvedValue({ email: 'person@example.com', token: 'token-1' });
    getPointAccessesAmount.mockResolvedValue({ type: 'okay', data: 5 });

    await expect(pointAccessNo(3)).resolves.toBe(5);
    expect(getPointAccessesAmount).toHaveBeenCalledWith(
      'person@example.com',
      'token-1',
      3,
    );
    expect(invalidateLogin).not.toHaveBeenCalled();
  });

  it('clears the session instead of contacting the API when logged out', async () => {
    loggedIn.mockResolvedValue(false);

    await expect(pointAccessNo(3)).resolves.toBeUndefined();
    expect(getPointAccessesAmount).not.toHaveBeenCalled();
    expect(invalidateLogin).toHaveBeenCalledTimes(1);
  });
});
