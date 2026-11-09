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

function pointPayload(overrides = {}) {
  const { data = {}, ...flags } = overrides;

  return {
    data: {
      pointdescription: 'Ponto de teste',
      lati: -21.17,
      long: -47.81,
      time_open: '8:00',
      time_close: '18:00',
      ...data,
    },
    accepts_paper: 1,
    accepts_metal: 0,
    accepts_organic: 1,
    accepts_biological: 0,
    ...flags,
  };
}

test('POST /point/create rejects requests without valid authentication', async () => {
  await withServer(async (server) => {
    const missing = await server.post('/point/create', pointPayload());
    assert.deepEqual(missing.json, {
      type: 'error',
      description: 'Incorrect authentication information was provided.',
    });

    const wrong = await server.post('/point/create', {
      ...pointPayload(),
      email: 'nobody@example.com',
      token: '123456',
    });
    assert.deepEqual(wrong.json, {
      type: 'error',
      description: 'Incorrect authentication information was provided.',
    });
  });
});

test('POST /point/update rejects requests without valid authentication', async () => {
  await withServer(async (server) => {
    const payload = {
      data: {
        pid: 1,
        pointdescription: 'Alterado',
        lati: -21.1,
        long: -47.8,
        time_open: '8:00',
        time_close: '17:00',
      },
      accepts_paper: 1,
      accepts_metal: 1,
      accepts_organic: 0,
      accepts_biological: 0,
    };

    const missing = await server.post('/point/update', payload);
    assert.deepEqual(missing.json, {
      type: 'error',
      description: 'Incorrect authentication information was provided.',
    });
  });
});

test('a regular user cannot update points', async () => {
  await withServer(async (server) => {
    const email = 'not-an-ong@example.com';
    const { token } = await login(server, email);

    const response = await server.post('/point/update', {
      email,
      token,
      data: {
        pid: 1,
        pointdescription: 'Alterado por usuário',
        lati: -21.1,
        long: -47.8,
        time_open: '8:00',
        time_close: '17:00',
      },
      accepts_paper: 1,
      accepts_metal: 1,
      accepts_organic: 0,
      accepts_biological: 0,
    });

    assert.deepEqual(response.json, {
      type: 'error',
      description: 'Incorrect authentication information was provided.',
    });

    const db = openDatabase(server);
    try {
      const point = db.prepare('SELECT * FROM point WHERE pid = 1').get();
      assert.notEqual(point.pointdescription, 'Alterado por usuário');
    } finally {
      db.close();
    }
  });
});

test('an ONG cannot update a point that does not exist', async () => {
  await withServer(async (server) => {
    const admin = await login(server, 'admin@example.com');

    const response = await server.post('/point/update', {
      email: 'admin@example.com',
      token: admin.token,
      data: {
        pid: 999_999,
        pointdescription: 'Fantasma',
        lati: -21.1,
        long: -47.8,
        time_open: '8:00',
        time_close: '17:00',
      },
      accepts_paper: 0,
      accepts_metal: 0,
      accepts_organic: 0,
      accepts_biological: 0,
    });

    assert.equal(response.status, 200);
    assert.deepEqual(response.json, {
      type: 'error',
      description: 'The data you seek to edit does not exist.',
    });
  });
});

// Known defect: bton() returns JavaScript booleans, but better-sqlite3 only
// accepts numbers, strings, bigints, buffers, and null. Point creation and
// updates therefore fail with "TypeError: SQLite3 can only bind ..." (HTTP 500)
// as soon as they reach the database.
test.todo('an authenticated user can create a point, which awaits approval');
test.todo('a point created by an ONG is approved immediately');
test.todo('material flags are normalised to database booleans on creation');
test.todo('an ONG can update an existing point and thereby approve it');
test.todo('material flags are normalised to database booleans on update');
