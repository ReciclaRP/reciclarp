import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  checkLoginState,
  createReport,
  getLoginToken,
  pullMapData,
  sendLoginCode,
} from '../src/logic/backend.js';

const API_URL = 'http://localhost:3000';

function jsonResponse(data) {
  return {
    ok: true,
    status: 200,
    json: vi.fn().mockResolvedValue(data),
  };
}

function expectedRequest(body) {
  return {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  };
}

describe('webapp API client', () => {
  let fetchMock;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('pulls the point list from /point/list', async () => {
    const points = [{ pid: 1, pointdescription: 'Ecoponto' }];
    fetchMock.mockResolvedValue(jsonResponse(points));

    await expect(pullMapData()).resolves.toEqual(points);
    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/point/list`,
      expectedRequest({ data: 'test' }),
    );
  });

  it('requests a login code for the supplied e-mail', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ type: 'okay' }));

    await expect(sendLoginCode('person@example.com')).resolves.toEqual({
      type: 'okay',
    });
    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/auth/login`,
      expectedRequest({ email: 'person@example.com' }),
    );
  });

  it('exchanges an e-mail and code for a login token', async () => {
    const payload = { type: 'okay', token: '123456' };
    fetchMock.mockResolvedValue(jsonResponse(payload));

    await expect(getLoginToken('person@example.com', '54321')).resolves.toEqual(
      payload,
    );
    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/auth/token`,
      expectedRequest({ email: 'person@example.com', code: '54321' }),
    );
  });

  it('checks a login token against /auth/check', async () => {
    const payload = { type: 'okay', email: 'person@example.com', id: 3 };
    fetchMock.mockResolvedValue(jsonResponse(payload));

    await expect(checkLoginState('person@example.com', 'token-1')).resolves.toEqual(
      payload,
    );
    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/auth/check`,
      expectedRequest({ email: 'person@example.com', token: 'token-1' }),
    );
  });

  it('creates a report with the point id and report details', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ type: 'okay' }));

    await expect(
      createReport('person@example.com', 'token-1', 42, {
        description: 'O ponto está cheio',
        problem_kind: 'pointfull',
      }),
    ).resolves.toEqual({ type: 'okay' });

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/report/create`,
      expectedRequest({
        email: 'person@example.com',
        token: 'token-1',
        description: 'O ponto está cheio',
        problem_kind: 'pointfull',
        pid: 42,
      }),
    );
  });

  it('propagates network failures to the caller', async () => {
    fetchMock.mockRejectedValue(new Error('network down'));

    await expect(pullMapData()).rejects.toThrow('network down');
  });

  it('propagates invalid JSON responses to the caller', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      json: vi.fn().mockRejectedValue(new SyntaxError('not json')),
    });

    await expect(sendLoginCode('person@example.com')).rejects.toThrow('not json');
  });
});
