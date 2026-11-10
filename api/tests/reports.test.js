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

test('POST /report/create rejects requests without valid authentication', async () => {
  await withServer(async (server) => {
    const response = await server.post('/report/create', {
      description: 'O ponto está cheio',
      problem_kind: 'pointfull',
      pid: 1,
    });

    assert.equal(response.status, 200);
    assert.deepEqual(response.json, {
      type: 'error',
      description: 'Incorrect authentication information was provided.',
    });
  });
});

test('POST /report/create requires a description, category, and point id', async () => {
  await withServer(async (server) => {
    const email = 'reporter@example.com';
    const { token } = await login(server, email);

    const incompleteBodies = [
      { email, token, problem_kind: 'pointfull', pid: 1 },
      { email, token, description: 'Cheio', pid: 1 },
      { email, token, description: 'Cheio', problem_kind: 'pointfull' },
      { email, token, description: '', problem_kind: 'pointfull', pid: 1 },
    ];

    for (const body of incompleteBodies) {
      const response = await server.post('/report/create', body);

      assert.equal(response.status, 200);
      assert.deepEqual(response.json, {
        type: 'error',
        description: 'Insufficient information was provided.',
      });
    }
  });
});

test('POST /report/create persists a report for the authenticated user and point', async () => {
  await withServer(async (server) => {
    const email = 'reporter@example.com';
    const { token } = await login(server, email);

    const response = await server.post('/report/create', {
      email,
      token,
      description: 'O ponto está cheio',
      problem_kind: 'pointfull',
      pid: 1,
    });

    assert.equal(response.status, 200);
    assert.deepEqual(response.json, { type: 'okay' });

    const db = openDatabase(server);
    try {
      const reports = db.prepare('SELECT * FROM report').all();
      assert.equal(reports.length, 1);

      const report = reports[0];
      assert.equal(report.reportdescription, 'O ponto está cheio');
      assert.equal(report.uid, 1);
      assert.equal(report.pid, 1);
      for (const category of [
        report.category_noexist,
        report.category_full,
        report.category_badtime,
      ]) {
        assert.ok(category === 0 || category === 1);
      }
    } finally {
      db.close();
    }
  });
});

test('POST /report/create stores a report with the correct category', async () => {
  await withServer(async (server) => {
    const email = 'categories@example.com';
    const { token } = await login(server, email);

    const cases = [
      {
        description: 'O ponto não existe',
        problem_kind: 'pointabsent',
        expected: { category_noexist: 1, category_full: 0, category_badtime: 0 },
      },
      {
        description: 'O ponto está cheio',
        problem_kind: 'pointfull',
        expected: { category_noexist: 0, category_full: 1, category_badtime: 0 },
      },
      {
        description: 'O ponto tem horário errado',
        problem_kind: 'pointtime',
        expected: { category_noexist: 0, category_full: 0, category_badtime: 1 },
      },
    ];

    for (const entry of cases) {
      const response = await server.post('/report/create', {
        email,
        token,
        description: entry.description,
        problem_kind: entry.problem_kind,
        pid: 1,
      });

      assert.equal(response.status, 200);
      assert.deepEqual(response.json, { type: 'okay' });
    }

    const db = openDatabase(server);
    try {
      for (const entry of cases) {
        const report = db
          .prepare('SELECT * FROM report WHERE reportdescription = ?')
          .get(entry.description);

        assert.ok(report, `missing report for ${entry.problem_kind}`);
        assert.equal(report.category_noexist, entry.expected.category_noexist);
        assert.equal(report.category_full, entry.expected.category_full);
        assert.equal(report.category_badtime, entry.expected.category_badtime);
      }
    } finally {
      db.close();
    }
  });
});
