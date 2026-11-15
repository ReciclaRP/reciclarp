'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { openDatabase, startApiServer } = require('./support/harness.js');
const { __RECICLA_POINT_SEED } = require('../src/db/schema.js');

async function withServer(callback) {
  const server = await startApiServer();

  try {
    await callback(server);
  } finally {
    await server.close();
  }
}

test('a fresh database is seeded with the admin account and the ecopontos', async () => {
  await withServer(async (server) => {
    const db = openDatabase(server);

    try {
      const users = db.prepare('SELECT * FROM user').all();
      assert.equal(users.length, 1);
      assert.equal(users[0].id, 0);
      assert.equal(users[0].uname, 'Admin');
      assert.equal(users[0].email, 'admin@example.com');
      assert.equal(users[0].ong, 1);
      assert.equal(users[0].validated, 1);
      assert.equal(users[0].banned, 0);

      const points = db.prepare('SELECT * FROM point ORDER BY pid').all();
      const seed = __RECICLA_POINT_SEED();

      assert.equal(points.length, seed.length);
      for (let index = 0; index < seed.length; index += 1) {
        assert.equal(points[index].pointdescription, seed[index][0]);
        assert.equal(points[index].approved, 1);
        assert.equal(points[index].creator, 0);
      }
    } finally {
      db.close();
    }
  });
});

test('POST /point/list exposes all seeded points without authentication', async () => {
  await withServer(async (server) => {
    const response = await server.post('/point/list', {});
    const seed = __RECICLA_POINT_SEED();

    assert.equal(response.status, 200);
    assert.ok(Array.isArray(response.json));
    assert.equal(response.json.length, seed.length);

    assert.deepEqual(
      response.json.map((point) => point.pointdescription),
      seed.map((point) => point[0]),
    );

    for (const point of response.json) {
      assert.equal(typeof point.pid, 'number');
      assert.equal(typeof point.lati, 'number');
      assert.equal(typeof point.long, 'number');
      assert.equal(typeof point.time_open, 'string');
      assert.equal(typeof point.time_close, 'string');
      assert.equal(typeof point.approved, 'number');
      assert.equal(typeof point.creator, 'number');
    }
  });
});

test('GET /api/ping reports the client address', async () => {
  await withServer(async (server) => {
    const response = await server.get('/api/ping', { localAddress: '127.0.0.77' });

    assert.equal(response.status, 200);
    assert.match(response.text, /127\.0\.0\.77/);
  });
});

test('the server does not advertise its implementation through X-Powered-By', async () => {
  await withServer(async (server) => {
    const response = await server.get('/api/ping');

    assert.equal(response.status, 200);
    assert.equal(response.headers['x-powered-by'], undefined);
  });
});

test('CORS advertises the configured web application origin and never echoes other origins', async () => {
  await withServer(async (server) => {
    const allowed = await server.get('/api/ping', {
      headers: { origin: 'http://localhost:5173' },
    });
    assert.equal(allowed.headers['access-control-allow-origin'], 'http://localhost:5173');

    const denied = await server.get('/api/ping', {
      headers: { origin: 'https://evil.example' },
    });
    assert.notEqual(denied.headers['access-control-allow-origin'], 'https://evil.example');
    assert.equal(denied.headers['access-control-allow-origin'], 'http://localhost:5173');
  });
});

test('unknown routes return a 404 response', async () => {
  await withServer(async (server) => {
    const response = await server.get('/route-that-does-not-exist');

    assert.equal(response.status, 404);
    assert.match(response.text, /Cannot GET \/route-that-does-not-exist/);
  });
});
