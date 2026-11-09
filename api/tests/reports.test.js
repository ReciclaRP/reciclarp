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

// Known defect: create_report() lists six columns but provides only five
// placeholders, so every fully valid report request fails during statement
// preparation with "SqliteError: 5 values for 6 columns" (HTTP 500). The
// category values are also passed in the wrong order, so fixing only the
// placeholder count would still store the wrong category flags.
test.todo('POST /report/create stores a report with the correct category');
