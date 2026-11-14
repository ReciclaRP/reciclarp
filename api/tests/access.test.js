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

function readAccesses(server, pid) {
  const db = openDatabase(server);

  try {
    return db
      .prepare('SELECT * FROM access WHERE pid = ? ORDER BY aid DESC')
      .all(pid);
  } finally {
    db.close();
  }
}

async function logAccess(server, email, token, pid) {
  return server.post('/point/access/log', { email, token, pid });
}

test('POST /point/access/log records one access for the authenticated user and point', async () => {
  await withServer(async (server) => {
    const email = 'visitor@example.com';
    const { token } = await login(server, email);

    const response = await logAccess(server, email, token, 1);

    assert.equal(response.status, 200);
    assert.deepEqual(response.json, { type: 'okay' });

    const accesses = readAccesses(server, 1);
    assert.equal(accesses.length, 1);
    assert.equal(accesses[0].pid, 1);
    assert.equal(accesses[0].uid, 1);
    assert.match(accesses[0].hour_accessed, /^([01]?\d|2[0-3]):[0-5]\d$/);
  });
});

test('POST /point/access/log requires a valid session and a point id', async () => {
  await withServer(async (server) => {
    const email = 'access-no-auth@example.com';
    const { token } = await login(server, email);

    const withoutToken = await server.post('/point/access/log', { email, pid: 1 });
    assert.equal(withoutToken.status, 200);
    assert.deepEqual(withoutToken.json, {
      type: 'error',
      description: 'Incorrect authentication information was provided.',
    });

    const withoutPid = await logAccess(server, email, token, undefined);
    assert.equal(withoutPid.status, 200);
    assert.deepEqual(withoutPid.json, {
      type: 'error',
      description: 'Insufficient data was provided.',
    });

    assert.deepEqual(readAccesses(server, 1), []);
  });
});

test('POST /point/access/log rejects a point that does not exist', async () => {
  await withServer(async (server) => {
    const email = 'access-missing-point@example.com';
    const { token } = await login(server, email);

    const response = await logAccess(server, email, token, 999_999);

    assert.equal(response.status, 200);
    assert.deepEqual(response.json, {
      type: 'error',
      description: 'The data you seek to access does not exist.',
    });

    const db = openDatabase(server);
    try {
      const { total } = db.prepare('SELECT COUNT(*) AS total FROM access').get();
      assert.equal(total, 0);
    } finally {
      db.close();
    }
  });
});

test('POST /point/access/no returns the number of accesses for an ONG', async () => {
  await withServer(async (server) => {
    const email = 'visitor-many@example.com';
    const { token } = await login(server, email);

    for (let index = 0; index < 3; index += 1) {
      const response = await logAccess(server, email, token, 1);
      assert.deepEqual(response.json, { type: 'okay' });
    }

    const admin = await login(server, 'admin@example.com');
    const response = await server.post('/point/access/no', {
      email: 'admin@example.com',
      token: admin.token,
      pid: 1,
    });

    assert.equal(response.status, 200);
    assert.deepEqual(response.json, { type: 'okay', data: 3 });
  });
});

test('POST /point/access/no is restricted to ONGs', async () => {
  await withServer(async (server) => {
    const email = 'citizen-stats@example.com';
    const { token } = await login(server, email);

    const response = await server.post('/point/access/no', {
      email,
      token,
      pid: 1,
    });

    assert.equal(response.status, 200);
    assert.deepEqual(response.json, {
      type: 'error',
      description: 'Incorrect authentication information was provided.',
    });
  });
});

test('POST /point/access/no rejects a point that does not exist', async () => {
  await withServer(async (server) => {
    const admin = await login(server, 'admin@example.com');

    const response = await server.post('/point/access/no', {
      email: 'admin@example.com',
      token: admin.token,
      pid: 999_999,
    });

    assert.equal(response.status, 200);
    assert.deepEqual(response.json, {
      type: 'error',
      description: 'The data you seek to access does not exist.',
    });
  });
});

test('POST /point/access/get returns the newest accesses up to the requested limit', async () => {
  await withServer(async (server) => {
    const email = 'visitor-history@example.com';
    const { token } = await login(server, email);

    for (let index = 0; index < 3; index += 1) {
      await logAccess(server, email, token, 1);
    }

    const admin = await login(server, 'admin@example.com');
    const response = await server.post('/point/access/get', {
      email: 'admin@example.com',
      token: admin.token,
      pid: 1,
      no: 2,
    });

    assert.equal(response.status, 200);
    assert.equal(response.json.type, 'okay');
    assert.equal(response.json.data.length, 2);

    const newest = readAccesses(server, 1).slice(0, 2);
    assert.deepEqual(
      response.json.data.map((entry) => entry.aid),
      newest.map((entry) => entry.aid),
    );
    for (const entry of response.json.data) {
      assert.equal(entry.pid, 1);
      assert.equal(entry.uid, 1);
      assert.match(entry.hour_accessed, /^([01]?\d|2[0-3]):[0-5]\d$/);
    }
  });
});

test('POST /point/access/get requires a pid and a limit, and is restricted to ONGs', async () => {
  await withServer(async (server) => {
    const email = 'citizen-history@example.com';
    const { token } = await login(server, email);

    const withoutLimit = await server.post('/point/access/get', {
      email,
      token,
      pid: 1,
    });
    assert.equal(withoutLimit.status, 200);
    assert.deepEqual(withoutLimit.json, {
      type: 'error',
      description: 'Insufficient data was provided.',
    });

    const withoutPid = await server.post('/point/access/get', {
      email,
      token,
      no: 5,
    });
    assert.equal(withoutPid.status, 200);
    assert.deepEqual(withoutPid.json, {
      type: 'error',
      description: 'Insufficient data was provided.',
    });

    const admin = await login(server, 'admin@example.com');
    const asCitizen = await server.post('/point/access/get', {
      email,
      token,
      pid: 1,
      no: 5,
    });
    assert.deepEqual(asCitizen.json, {
      type: 'error',
      description: 'Incorrect authentication information was provided.',
    });

    const asOng = await server.post('/point/access/get', {
      email: 'admin@example.com',
      token: admin.token,
      pid: 1,
      no: 5,
    });
    assert.equal(asOng.status, 200);
    assert.deepEqual(asOng.json, { type: 'okay', data: [] });
  });
});
