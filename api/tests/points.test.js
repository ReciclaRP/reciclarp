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

function findPointByDescription(server, description) {
  const db = openDatabase(server);

  try {
    return db
      .prepare('SELECT * FROM point WHERE pointdescription = ? ORDER BY pid DESC')
      .get(description);
  } finally {
    db.close();
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

test('an authenticated user can create a point, which awaits approval', async () => {
  await withServer(async (server) => {
    const email = 'creator@example.com';
    const { token } = await login(server, email);

    const response = await server.post('/point/create', {
      ...pointPayload({
        data: {
          pointdescription: 'Ponto do criador',
          lati: -21.2,
          long: -47.82,
          time_open: '7:30',
          time_close: '19:30',
        },
      }),
      email,
      token,
    });

    assert.equal(response.status, 200);
    assert.deepEqual(response.json, { type: 'okay' });

    const point = findPointByDescription(server, 'Ponto do criador');
    assert.ok(point);
    assert.equal(point.lati, -21.2);
    assert.equal(point.long, -47.82);
    assert.equal(point.time_open, '7:30');
    assert.equal(point.time_close, '19:30');
    assert.equal(point.accepts_paper, 1);
    assert.equal(point.accepts_metal, 0);
    assert.equal(point.accepts_organic, 1);
    assert.equal(point.accepts_biological, 0);
    assert.equal(point.approved, 0, 'points created by regular users require approval');
    assert.equal(point.creator, 1);

    const list = await server.post('/point/list', {});
    assert.ok(list.json.some((entry) => entry.pid === point.pid));
  });
});

test('a point created by an ONG is approved immediately', async () => {
  await withServer(async (server) => {
    const { token } = await login(server, 'admin@example.com');

    const response = await server.post('/point/create', {
      ...pointPayload({ data: { pointdescription: 'Ponto da ONG' } }),
      email: 'admin@example.com',
      token,
    });

    assert.deepEqual(response.json, { type: 'okay' });

    const point = findPointByDescription(server, 'Ponto da ONG');
    assert.ok(point);
    assert.equal(point.approved, 1);
    assert.equal(point.creator, 0);
  });
});

test('material flags are normalised to database booleans on creation', async () => {
  await withServer(async (server) => {
    const email = 'flags@example.com';
    const { token } = await login(server, email);

    const response = await server.post('/point/create', {
      ...pointPayload({ data: { pointdescription: 'Ponto com flags' } }),
      email,
      token,
      accepts_paper: true,
      accepts_metal: '0',
      accepts_organic: '',
      accepts_biological: 1,
    });

    assert.deepEqual(response.json, { type: 'okay' });

    const point = findPointByDescription(server, 'Ponto com flags');
    assert.ok(point);
    assert.equal(point.accepts_paper, 1);
    assert.equal(point.accepts_metal, 0);
    assert.equal(point.accepts_organic, 0);
    assert.equal(point.accepts_biological, 1);
  });
});

test('an ONG can update an existing point and thereby approve it', async () => {
  await withServer(async (server) => {
    const creatorEmail = 'pending-creator@example.com';
    const creator = await login(server, creatorEmail);

    await server.post('/point/create', {
      ...pointPayload({ data: { pointdescription: 'Ponto pendente' } }),
      email: creatorEmail,
      token: creator.token,
    });

    const pending = findPointByDescription(server, 'Ponto pendente');
    assert.ok(pending);
    assert.equal(pending.approved, 0);

    const admin = await login(server, 'admin@example.com');
    const response = await server.post('/point/update', {
      email: 'admin@example.com',
      token: admin.token,
      data: {
        pid: pending.pid,
        pointdescription: 'Ponto aprovado',
        lati: -21.25,
        long: -47.75,
        time_open: '6:00',
        time_close: '20:00',
      },
      accepts_paper: 0,
      accepts_metal: 1,
      accepts_organic: 0,
      accepts_biological: 1,
    });

    assert.equal(response.status, 200);
    assert.deepEqual(response.json, { type: 'okay' });

    const db = openDatabase(server);
    try {
      const point = db.prepare('SELECT * FROM point WHERE pid = ?').get(pending.pid);
      assert.equal(point.pointdescription, 'Ponto aprovado');
      assert.equal(point.lati, -21.25);
      assert.equal(point.long, -47.75);
      assert.equal(point.time_open, '6:00');
      assert.equal(point.time_close, '20:00');
      assert.equal(point.accepts_paper, 0);
      assert.equal(point.accepts_metal, 1);
      assert.equal(point.accepts_organic, 0);
      assert.equal(point.accepts_biological, 1);
      assert.equal(point.approved, 1);
      assert.equal(point.creator, pending.creator, 'the original creator must be preserved');
    } finally {
      db.close();
    }
  });
});

test('material flags are normalised to database booleans on update', async () => {
  await withServer(async (server) => {
    const admin = await login(server, 'admin@example.com');

    const response = await server.post('/point/update', {
      email: 'admin@example.com',
      token: admin.token,
      data: {
        pid: 1,
        pointdescription: 'Ponto com flags atualizadas',
        lati: -21.12,
        long: -47.83,
        time_open: '8:00',
        time_close: '17:00',
      },
      accepts_paper: true,
      accepts_metal: '0',
      accepts_organic: '',
      accepts_biological: 1,
    });

    assert.deepEqual(response.json, { type: 'okay' });

    const db = openDatabase(server);
    try {
      const point = db.prepare('SELECT * FROM point WHERE pid = 1').get();
      assert.equal(point.pointdescription, 'Ponto com flags atualizadas');
      assert.equal(point.accepts_paper, 1);
      assert.equal(point.accepts_metal, 0);
      assert.equal(point.accepts_organic, 0);
      assert.equal(point.accepts_biological, 1);
      assert.equal(point.approved, 1);
    } finally {
      db.close();
    }
  });
});
