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
      name: '402500915_DEFAULT_NAME',
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
      name: 'Admin',
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

test('POST /auth/check does not write authentication tokens to logs', async () => {
  await withServer(async (server) => {
    const email = 'quiet-user@example.com';
    const { token } = await login(server, email);
    const logStart = server.logLines.length;

    const response = await server.post('/auth/check', { email, token });
    assert.equal(response.json.type, 'okay');

    const checkLogs = server.logLines.slice(logStart);
    assert.ok(checkLogs.length > 0, 'the route should still emit its normal log line');
    for (const line of checkLogs) {
      assert.ok(!line.includes(token), `the token leaked into a log line: ${line}`);
    }
  });
});

test('POST /auth/login rejects an invalid e-mail without an internal error', async () => {
  await withServer(async (server) => {
    const response = await server.post(
      '/auth/login',
      { email: 'not-an-email' },
      { localAddress: '127.0.0.203' },
    );

    assert.equal(response.status, 200);
    assert.deepEqual(response.json, {
      type: 'error',
      description:
        'The account does not exist and could not be created. Did you use a real e-mail address?',
    });

    const db = openDatabase(server);
    try {
      const created = db
        .prepare('SELECT * FROM user WHERE email = ?')
        .get('not-an-email');
      assert.equal(created, undefined, 'an invalid address must not become an account');
    } finally {
      db.close();
    }
  });
});

test('POST /auth/login leaves existing accounts untouched for an invalid e-mail', async () => {
  await withServer(async (server) => {
    const response = await server.post(
      '/auth/login',
      { email: 'not-an-email' },
      { localAddress: '127.0.0.203' },
    );

    assert.equal(response.status, 200);

    const db = openDatabase(server);
    try {
      const admin = db.prepare('SELECT * FROM user WHERE id = 0').get();
      assert.ok(admin);
      assert.equal(admin.email, 'admin@example.com');
      assert.equal(admin.uname, 'Admin');
      assert.equal(admin.banned, 0);
      assert.equal(admin.validated, 1);
      assert.equal(admin.ong, 1);

      const rejected = db
        .prepare('SELECT * FROM user WHERE email = ?')
        .get('not-an-email');
      assert.equal(rejected, undefined, 'an invalid address must not become an account');
    } finally {
      db.close();
    }
  });
});
