'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const { login } = require('./support/auth.js');
const { openDatabase, startApiServer } = require('./support/harness.js');

test('accounts and points survive an API restart without reseeding', async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'reciclarp-persistence-'));
  let firstServer;

  try {
    firstServer = await startApiServer({ directory });
    const email = 'persistent@example.com';
    await login(firstServer, email);

    // /point/create is currently broken (see points.test.js), so insert the
    // row directly to exercise the database lifecycle rather than the route.
    const firstDb = openDatabase(firstServer, {});
    try {
      const user = firstDb.prepare('SELECT id FROM user WHERE email = ?').get(email);
      firstDb
        .prepare(`
          INSERT INTO point (
            pointdescription, lati, long, time_open, time_close,
            accepts_paper, accepts_metal, accepts_organic, accepts_biological,
            approved, creator
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .run(
          'Ponto persistente',
          -21.11,
          -47.71,
          '9:00',
          '18:00',
          1,
          0,
          0,
          0,
          0,
          user.id,
        );
    } finally {
      firstDb.close();
    }

    await firstServer.close();
    firstServer = undefined;

    const secondServer = await startApiServer({ directory });
    try {
      const list = await secondServer.post('/point/list', {});
      assert.equal(list.json.length, 9, 'the new point should still be present');
      assert.ok(list.json.some((point) => point.pointdescription === 'Ponto persistente'));

      await login(secondServer, email);

      const db = openDatabase(secondServer);
      try {
        const users = db.prepare('SELECT * FROM user WHERE email = ?').all(email);
        assert.equal(users.length, 1, 'restarting must not create a duplicate account');

        const admins = db.prepare("SELECT * FROM user WHERE email = 'admin@example.com'").all();
        assert.equal(admins.length, 1, 'restarting must not seed another admin');

        const points = db.prepare('SELECT * FROM point').all();
        assert.equal(points.length, 9, 'restarting must not seed another point batch');
      } finally {
        db.close();
      }
    } finally {
      await secondServer.close();
    }
  } finally {
    if (firstServer) {
      await firstServer.close();
    }
    await fsp.rm(directory, { recursive: true, force: true });
  }
});
