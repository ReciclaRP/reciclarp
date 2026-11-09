'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { login } = require('./support/auth.js');
const { openDatabase, startApiServer } = require('./support/harness.js');

async function withServer(callback) {
  const server = await startApiServer();

  try {
    await callback(server);
  } finally {
    await server.close();
  }
}

test('POST /auth/login rejects a request without an e-mail', async () => {
  await withServer(async (server) => {
    const response = await server.post('/auth/login', {});

    assert.equal(response.status, 200);
    assert.deepEqual(response.json, {
      type: 'error',
      description: 'Malformed request.',
    });
  });
});

test('POST /auth/login creates an account and sends a one-time code', async () => {
  await withServer(async (server) => {
    const email = 'new-user@example.com';
    const result = await login(server, email);

    assert.equal(result.loginResponse.status, 200);
    assert.deepEqual(result.loginResponse.json, {
      type: 'okay',
      description: 'Action has been taken.',
    });
    assert.match(result.code, /^\d{5}$/);

    const db = openDatabase(server);
    try {
      const user = db.prepare('SELECT * FROM user WHERE email = ?').get(email);
      assert.ok(user, 'the login should create the account');
      assert.equal(user.uname, '402500915_DEFAULT_NAME');
      assert.equal(user.banned, 0);
      assert.equal(user.validated, 0);
      assert.equal(user.ong, 0);
    } finally {
      db.close();
    }
  });
});

test('POST /auth/token exchanges a valid code for a numeric session token', async () => {
  await withServer(async (server) => {
    const email = 'token-user@example.com';
    const result = await login(server, email);

    assert.equal(result.tokenResponse.status, 200);
    assert.equal(result.tokenResponse.json.type, 'okay');
    assert.match(result.token, /^\d+$/);
    assert.ok(result.token.length >= 32, 'tokens should carry enough entropy');

    const secondLogin = await login(server, email);
    assert.equal(secondLogin.tokenResponse.json.type, 'okay');
    assert.notEqual(secondLogin.token, result.token, 'each login should get a fresh token');
  });
});

test('POST /auth/token refuses an incorrect code', async () => {
  await withServer(async (server) => {
    const email = 'wrong-code@example.com';
    const loginResponse = await server.post('/auth/login', { email });
    assert.equal(loginResponse.json.type, 'okay');

    const response = await server.post('/auth/token', {
      email,
      code: '000000',
    });

    assert.equal(response.status, 200);
    assert.deepEqual(response.json, {
      type: 'error',
      description: 'Incorrect code.',
    });
  });
});

test('POST /auth/token rejects malformed requests', async () => {
  await withServer(async (server) => {
    for (const body of [{}, { email: 'a@b.com' }, { code: '12345' }]) {
      const response = await server.post('/auth/token', body);

      assert.equal(response.status, 200);
      assert.deepEqual(response.json, {
        type: 'error',
        description: 'Malformed request.',
      });
    }
  });
});

test('POST /auth/check returns the authenticated account details', async () => {
  await withServer(async (server) => {
    const email = 'checked-user@example.com';
    const { token } = await login(server, email);

    const response = await server.post('/auth/check', { email, token });

    assert.equal(response.status, 200);
    assert.deepEqual(response.json, {
      type: 'okay',
      email,
      id: 1,
      banned: false,
      ong: false,
    });
  });
});

test('POST /auth/check refuses an incorrect token', async () => {
  await withServer(async (server) => {
    const email = 'checked-user@example.com';
    await login(server, email);

    const response = await server.post('/auth/check', { email, token: 'not-the-token' });

    assert.equal(response.status, 200);
    assert.deepEqual(response.json, {
      type: 'error',
      description: 'Incorrect authentication information was provided.',
    });
  });
});

test('POST /auth/check rejects malformed requests', async () => {
  await withServer(async (server) => {
    for (const body of [{}, { email: 'a@b.com' }, { token: '123456' }]) {
      const response = await server.post('/auth/check', body);

      assert.equal(response.status, 200);
      assert.deepEqual(response.json, {
        type: 'error',
        description: 'Malformed request',
      });
    }
  });
});

test('an ONG account is identified by the authentication endpoints', async () => {
  await withServer(async (server) => {
    const { token } = await login(server, 'admin@example.com');

    const response = await server.post('/auth/check', {
      email: 'admin@example.com',
      token,
    });

    assert.deepEqual(response.json, {
      type: 'okay',
      email: 'admin@example.com',
      id: 0,
      banned: false,
      ong: true,
    });
  });
});

test('POST /auth/login refuses a banned account', async () => {
  await withServer(async (server) => {
    const email = 'banned-user@example.com';
    await login(server, email, { localAddress: '127.0.0.101' });

    const db = openDatabase(server, {});
    try {
      db.prepare('UPDATE user SET banned = 1 WHERE email = ?').run(email);
    } finally {
      db.close();
    }

    const response = await server.post(
      '/auth/login',
      { email },
      { localAddress: '127.0.0.102' },
    );

    assert.equal(response.status, 200);
    assert.deepEqual(response.json, {
      type: 'error',
      description: 'The e-mail provided was unactionable.',
    });
  });
});

test('logging in again reuses the existing account', async () => {
  await withServer(async (server) => {
    const email = 'returning-user@example.com';
    await login(server, email);
    await login(server, email);

    const db = openDatabase(server);
    try {
      const users = db.prepare('SELECT * FROM user WHERE email = ?').all(email);
      assert.equal(users.length, 1);
    } finally {
      db.close();
    }
  });
});

test('the e-mail validator accepts common valid addresses', async () => {
  await withServer(async (server) => {
    const addresses = [
      'simple@example.com',
      'first.last+tag@example.co.uk',
      'user_name@sub.example.org',
    ];

    for (const email of addresses) {
      const response = await server.post('/auth/login', { email });
      assert.equal(response.status, 200);
      assert.equal(response.json.type, 'okay', `${email} should be accepted`);
    }
  });
});

// Known defect: Account.__get_data() reads `data.name`, but the column is
// called `uname`. Authenticated responses therefore omit the display name.
test.todo('POST /auth/check includes the account display name');

// Security concern: /auth/check writes both the stored token and the token
// supplied by the client to stdout, exposing session credentials in logs.
test.todo('POST /auth/check does not write authentication tokens to logs');

// Known defect: Account.ban() calls Account.__update(), whose UPDATE statement
// needs the account id but receives only four values. The request therefore
// fails with a RangeError (HTTP 500) instead of the documented "unactionable"
// response.
test.todo('POST /auth/login rejects an invalid e-mail without an internal error');
