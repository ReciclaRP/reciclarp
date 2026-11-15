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

test('POST /auth/delete rejects malformed requests', async () => {
  await withServer(async (server) => {
    for (const body of [{}, { email: 'a@b.com' }, { token: '123456' }]) {
      const response = await server.post('/auth/delete', body);

      assert.equal(response.status, 200);
      assert.deepEqual(response.json, {
        type: 'error',
        description: 'Malformed request',
      });
    }
  });
});

test('POST /auth/delete refuses an incorrect token', async () => {
  await withServer(async (server) => {
    const email = 'delete-wrong-token@example.com';
    await login(server, email);

    const response = await server.post('/auth/delete', {
      email,
      token: 'not-the-token',
    });

    assert.equal(response.status, 200);
    assert.deepEqual(response.json, {
      type: 'error',
      description: 'Incorrect authentication information was provided.',
    });
  });
});

test('POST /auth/delete refuses to delete a banned account', async () => {
  await withServer(async (server) => {
    const email = 'delete-banned@example.com';
    const { token } = await login(server, email);

    const db = openDatabase(server, {});
    try {
      db.prepare('UPDATE user SET banned = 1 WHERE email = ?').run(email);
    } finally {
      db.close();
    }

    const response = await server.post('/auth/delete', { email, token });

    assert.equal(response.status, 200);
    assert.deepEqual(response.json, {
      type: 'error',
      description: 'Your account cannot be deleted, as it is possibly banned.',
    });
  });
});

test('POST /auth/delete anonymises an active account', async () => {
  await withServer(async (server) => {
    const email = 'delete-active@example.com';
    const { token } = await login(server, email);

    const response = await server.post('/auth/delete', { email, token });

    assert.equal(response.status, 200);
    assert.deepEqual(response.json, { type: 'okay' });

    const db = openDatabase(server);
    try {
      const original = db.prepare('SELECT * FROM user WHERE email = ?').get(email);
      assert.equal(original, undefined, 'the original e-mail must no longer exist');

      const deleted = db
        .prepare('SELECT * FROM user WHERE email = ?')
        .get('deleted-email-recicla@comrades.sbs');
      assert.ok(deleted, 'the account should be anonymised');
      assert.equal(deleted.uname, 'Deleted User');
      assert.equal(deleted.banned, 0);
      assert.equal(deleted.validated, 1);
    } finally {
      db.close();
    }
  });
});
