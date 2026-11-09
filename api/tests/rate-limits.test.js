'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { login } = require('./support/auth.js');
const { startApiServer } = require('./support/harness.js');

async function withServer(callback) {
  const server = await startApiServer();

  try {
    await callback(server);
  } finally {
    await server.close();
  }
}

test('login attempts from one address are limited to one every two minutes', async () => {
  await withServer(async (server) => {
    const address = '127.0.0.150';
    await login(server, 'limited@example.com', { localAddress: address });

    const response = await server.post(
      '/auth/login',
      { email: 'limited-two@example.com' },
      { localAddress: address },
    );

    assert.equal(response.status, 429);
    assert.match(response.headers['ratelimit'], /1-in-2min/);
    assert.ok(Number(response.headers['retry-after']) > 0);
  });
});

test('different client addresses receive independent login quotas', async () => {
  await withServer(async (server) => {
    const first = await server.post(
      '/auth/login',
      { email: 'one@example.com' },
      { localAddress: '127.0.0.151' },
    );
    const second = await server.post(
      '/auth/login',
      { email: 'two@example.com' },
      { localAddress: '127.0.0.152' },
    );

    assert.equal(first.status, 200);
    assert.equal(first.json.type, 'okay');
    assert.equal(second.status, 200);
    assert.equal(second.json.type, 'okay');
  });
});

test('the general limiter allows 100 requests and rejects the next one', async () => {
  await withServer(async (server) => {
    const address = '127.0.0.153';

    for (let index = 0; index < 100; index += 1) {
      const response = await server.get('/api/ping', { localAddress: address });
      assert.equal(response.status, 200, `request ${index + 1} should be allowed`);
    }

    const rejected = await server.get('/api/ping', { localAddress: address });

    assert.equal(rejected.status, 429);
    assert.match(rejected.headers['ratelimit'], /100-in-15min/);
  });
});

test('the general limiter reports its remaining quota', async () => {
  await withServer(async (server) => {
    const address = '127.0.0.154';
    const response = await server.get('/api/ping', { localAddress: address });

    assert.equal(response.status, 200);
    assert.match(response.headers['ratelimit'], /^"?\d+-in-15min"; r=\d+; t=\d+/);
  });
});

// Known defect: the same expensive_stuff_limiter instance is mounted on
// /auth/login, /point/create, and /point/update, so the three routes share one
// two-minute quota. A successful login from an address therefore prevents that
// same address from creating or updating a point.
test.todo('login and point writes use independent rate-limit quotas');
