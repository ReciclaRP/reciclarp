import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/logic/login.js', () => ({
  loggedIn: vi.fn(),
  invalidateLogin: vi.fn(),
}));

vi.mock('../src/logic/backend.js', () => ({
  redeemCode: vi.fn(),
}));

import { redeemCode } from '../src/logic/backend.js';
import { invalidateLogin, loggedIn } from '../src/logic/login.js';
import { redeemSpecial } from '../src/logic/account.js';

describe('special code redemption', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redeems the code for the logged-in account', async () => {
    loggedIn.mockResolvedValue({ email: 'person@example.com', token: 'token-1' });
    redeemCode.mockResolvedValue({ type: 'okay' });

    await expect(redeemSpecial('CODE-1')).resolves.toBe(true);
    expect(redeemCode).toHaveBeenCalledWith(
      'person@example.com',
      'token-1',
      'CODE-1',
    );
  });

  it('returns false when the API rejects the code', async () => {
    loggedIn.mockResolvedValue({ email: 'person@example.com', token: 'token-1' });
    redeemCode.mockResolvedValue({ type: 'error' });

    await expect(redeemSpecial('CODE-1')).resolves.toBe(false);
  });

  it('returns false without calling the API when the visitor is logged out', async () => {
    loggedIn.mockResolvedValue(false);

    await expect(redeemSpecial('CODE-1')).resolves.toBeUndefined();
    expect(redeemCode).not.toHaveBeenCalled();
    expect(invalidateLogin).toHaveBeenCalledTimes(1);
  });
});
