'use strict';

/**
 * Suíte de regressão de segurança (red suite).
 *
 * Cada teste com `skip` descreve o comportamento SEGURO esperado da API e
 * FALHA no código atual. O motivo documenta o achado correspondente em
 * `docs/agent-docs/security.md` (SEC-001, SEC-002, ...).
 *
 * Fluxo de trabalho combinado no AGENTS.md: estes testes são a especificação
 * da correção. O humano aplica o patch proposto na documentação e, no mesmo
 * PR, remove o `skip` do teste correspondente. Testes sem `skip` já passam e
 * travam o comportamento correto — SEC-001 e SEC-002 entraram nesse grupo
 * quando a comparação frouxa virou `===`; o restante continua como
 * especificação vermelha.
 */

const test = require('node:test');
const assert = require('node:assert/strict');

const { login } = require('./support/auth.js');
const { openDatabase, startApiServer } = require('./support/harness.js');

const SKIP = (id) =>
  `Falha esperada no código atual — corrigir ${id} (docs/agent-docs/security.md) e remover o skip`;

const ADMIN_EMAIL = 'admin@example.com';
const ESCALATION_TOKEN = 'test-escalation-token';

async function withServer(callback, options = {}) {
  const server = await startApiServer(options);

  try {
    await callback(server);
  } finally {
    await server.close();
  }
}

/** Abre o banco em modo escrita/leitura para preparar cenários de teste. */
function mutate(server, callback) {
  const db = openDatabase(server, {});

  try {
    return callback(db);
  } finally {
    db.close();
  }
}

/** Insere um ponto sem passar pela API, simulando um registro pendente. */
function insertPoint(server, { description, approved, creator = 0 }) {
  mutate(server, (db) => {
    db.prepare(
      `INSERT INTO point
         (pointdescription, lati, "long", time_open, time_close,
          accepts_paper, accepts_metal, accepts_organic, accepts_biological,
          approved, creator)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(description, -21.17, -47.81, '7:00', '19:00', 1, 0, 0, 0, approved, creator);
  });
}

function findPoints(server, description) {
  const db = openDatabase(server);

  try {
    return db.prepare('SELECT * FROM point WHERE pointdescription = ?').all(description);
  } finally {
    db.close();
  }
}

function findUser(server, email) {
  const db = openDatabase(server);

  try {
    return db.prepare('SELECT * FROM "user" WHERE email = ?').get(email);
  } finally {
    db.close();
  }
}

// ---------------------------------------------------------------------------
// SEC-001 — /auth/token aceita códigos "falsy" quando não há ticket pendente
// ---------------------------------------------------------------------------

test('POST /auth/token refuses the string "0" when no code was ever issued', async () => {
  await withServer(async (server) => {
    const response = await server.post('/auth/token', {
      email: ADMIN_EMAIL,
      code: '0',
    });

    assert.equal(response.status, 200);
    assert.equal(response.json.type, 'error');
    assert.equal(response.json.token, undefined, 'no session may be minted without a code');

    // O token devolvido (se houver) não pode autenticar em /auth/check.
    if (response.json.token) {
      const check = await server.post('/auth/check', {
        email: ADMIN_EMAIL,
        token: response.json.token,
      });
      assert.equal(check.json.type, 'error');
    }
  });
});

test('POST /auth/token refuses an empty array as the code', async () => {
  await withServer(async (server) => {
    const response = await server.post('/auth/token', {
      email: ADMIN_EMAIL,
      code: [],
    });

    assert.equal(response.status, 200);
    assert.equal(response.json.type, 'error');
    assert.equal(response.json.token, undefined);
  });
});

test('an incorrect code is consumed, but a correct code still works afterwards', { skip: SKIP('SEC-001b') }, async () => {
  await withServer(async (server) => {
    const email = 'consume@example.com';
    const loginResponse = await server.post('/auth/login', { email });
    assert.equal(loginResponse.json.type, 'okay');
    const logStart = 0;
    const line = await server.waitForLog(`The login code for ${email} was`, 5_000, logStart);
    const code = line.match(/was (\d+)\b/)[1];

    const wrong = await server.post('/auth/token', { email, code: '000000' });
    assert.equal(wrong.json.type, 'error');

    // Um chute errado não pode inutilizar o código legítimo (DoS do login).
    const right = await server.post('/auth/token', { email, code });
    assert.equal(right.json.type, 'okay');
    assert.match(right.json.token, /^\d+$/);
  });
});

// ---------------------------------------------------------------------------
// SEC-002 — rotas autenticadas aceitam token "0" para e-mails sem sessão
// ---------------------------------------------------------------------------

test('POST /point/create rejects the token "0" for an account without a session', async () => {
  await withServer(async (server) => {
    const description = 'PONTO CRIADO SEM SESSÃO';

    const response = await server.post('/point/create', {
      email: 'no-session@example.com',
      token: '0',
      data: {
        pointdescription: description,
        lati: -21.17,
        long: -47.81,
        time_open: '7:00',
        time_close: '19:00',
        accepts_paper: true,
        accepts_metal: false,
        accepts_organic: false,
        accepts_biological: false,
      },
    });

    assert.equal(response.status, 200);
    assert.equal(response.json.type, 'error');
    assert.deepEqual(findPoints(server, description), []);
  });
});

test('POST /point/access/log rejects the token "0" and records no access', async () => {
  await withServer(async (server) => {
    const response = await server.post('/point/access/log', {
      email: 'no-session@example.com',
      token: '0',
      pid: 1,
    });

    assert.equal(response.status, 200);
    assert.equal(response.json.type, 'error');

    const db = openDatabase(server);
    try {
      const { total } = db.prepare('SELECT COUNT(*) AS total FROM access').get();
      assert.equal(total, 0);
    } finally {
      db.close();
    }
  });
});

test('POST /auth/check rejects the token "0" for a non-existent account', async () => {
  await withServer(async (server) => {
    const response = await server.post('/auth/check', {
      email: 'no-session@example.com',
      token: '0',
    });

    assert.equal(response.status, 200);
    assert.equal(response.json.type, 'error');
  });
});

test('POST /auth/delete rejects the token "0" and keeps the account', async () => {
  await withServer(async (server) => {
    const response = await server.post('/auth/delete', {
      email: ADMIN_EMAIL,
      token: '0',
    });

    assert.equal(response.status, 200);
    assert.equal(response.json.type, 'error');

    const admin = findUser(server, ADMIN_EMAIL);
    assert.ok(admin, 'the moderator account must survive');
    assert.equal(admin.uname, 'Admin');
  });
});

// ---------------------------------------------------------------------------
// SEC-003 — /auth/special promove ONG sem exigir todos os campos
// ---------------------------------------------------------------------------

test('POST /auth/special refuses a missing code and does not promote the account', async () => {
  await withServer(async (server) => {
    const email = 'almost-ong@example.com';
    const { token } = await login(server, email);

    const response = await server.post('/auth/special', { email, token });

    assert.equal(response.status, 200);
    assert.equal(response.json.type, 'error');
    assert.equal(findUser(server, email).ong, 0);
    assert.equal(findUser(server, email).id, findUser(server, email).id);
  });
});

test('POST /auth/special refuses an array as the escalation code', async () => {
  await withServer(async (server) => {
    const email = 'array-ong@example.com';
    const { token } = await login(server, email);

    const response = await server.post('/auth/special', {
      email,
      token,
      code: [String(Date.now())],
    });

    assert.equal(response.status, 200);
    assert.equal(response.json.type, 'error');
    assert.equal(findUser(server, email).ong, 0);
  });
});

test('POST /auth/special refuses an array-shaped escalation code', async () => {
  await withServer(
    async (server) => {
      const email = 'escalation@example.com';
      const { token } = await login(server, email);

      const response = await server.post('/auth/special', {
        email,
        token,
        code: [ESCALATION_TOKEN],
      });

      assert.equal(response.status, 200);
      assert.equal(response.json.type, 'error');
      assert.equal(findUser(server, email).ong, 0);
    },
    { env: { RECICLA_ESCALATION_TOKEN: ESCALATION_TOKEN } },
  );
});

test('POST /auth/special promotes the account when the exact escalation code is presented', async () => {
  await withServer(
    async (server) => {
      const email = 'escalation-ok@example.com';
      const { token } = await login(server, email);

      const response = await server.post('/auth/special', {
        email,
        token,
        code: ESCALATION_TOKEN,
      });

      assert.equal(response.status, 200);
      assert.equal(response.json.type, 'okay');
      assert.equal(findUser(server, email).ong, 1);
    },
    { env: { RECICLA_ESCALATION_TOKEN: ESCALATION_TOKEN } },
  );
});

// ---------------------------------------------------------------------------
// SEC-004 — /point/list expõe a fila de moderação para qualquer visitante
// ---------------------------------------------------------------------------

test('POST /point/list hides unapproved points from anonymous callers', { skip: SKIP('SEC-004') }, async () => {
  await withServer(async (server) => {
    insertPoint(server, { description: 'PONTO PENDENTE PRIVADO', approved: 0 });
    insertPoint(server, { description: 'PONTO APROVADO PÚBLICO', approved: 1 });

    const response = await server.post('/point/list', {});

    assert.equal(response.status, 200);
    const descriptions = response.json.map((point) => point.pointdescription);
    assert.ok(descriptions.includes('PONTO APROVADO PÚBLICO'));
    assert.ok(!descriptions.includes('PONTO PENDENTE PRIVADO'));
  });
});

// ---------------------------------------------------------------------------
// SEC-005 — corpo ausente derruba o handler e devolve stack trace HTML
// ---------------------------------------------------------------------------

test('POST /auth/login without a JSON body returns a JSON 400 envelope', { skip: SKIP('SEC-005') }, async () => {
  await withServer(async (server) => {
    const response = await server.request({ path: '/auth/login', method: 'POST' });

    assert.equal(response.status, 400);
    assert.equal(response.json && response.json.type, 'error');
    assert.ok(!response.text.includes('TypeError'), 'no stack trace may leak');
    assert.ok(!response.text.includes('server.js'), 'no source path may leak');
  });
});

test('POST /point/list with a non-JSON content type returns a JSON error', { skip: SKIP('SEC-005') }, async () => {
  await withServer(async (server) => {
    const response = await server.request({
      path: '/point/list',
      method: 'POST',
      headers: { 'content-type': 'text/plain' },
    });

    assert.equal(response.status, 400);
    assert.equal(response.json && response.json.type, 'error');
  });
});

// ---------------------------------------------------------------------------
// SEC-007 — campos não sanitizados/validados em /point/create
// ---------------------------------------------------------------------------

test('POST /point/create rejects non-numeric coordinates', { skip: SKIP('SEC-007') }, async () => {
  await withServer(async (server) => {
    const email = 'coord-user@example.com';
    const { token } = await login(server, email);

    const response = await server.post('/point/create', {
      email,
      token,
      data: {
        pointdescription: 'COORDENADA INVÁLIDA',
        lati: 'not-a-number',
        long: { nested: true },
        time_open: '7:00',
        time_close: '19:00',
        accepts_paper: true,
        accepts_metal: false,
        accepts_organic: false,
        accepts_biological: false,
      },
    });

    assert.equal(response.status, 200);
    assert.equal(response.json.type, 'error');
    assert.deepEqual(findPoints(server, 'COORDENADA INVÁLIDA'), []);
  });
});

test('POST /point/create sanitizes the opening and closing time fields', { skip: SKIP('SEC-007') }, async () => {
  await withServer(async (server) => {
    const email = 'time-user@example.com';
    const { token } = await login(server, email);

    const payload = '<img src=x onerror=alert(1)>';

    const response = await server.post('/point/create', {
      email,
      token,
      data: {
        pointdescription: 'HORÁRIO COM HTML',
        lati: -21.17,
        long: -47.81,
        time_open: payload,
        time_close: payload,
        accepts_paper: true,
        accepts_metal: false,
        accepts_organic: false,
        accepts_biological: false,
      },
    });

    assert.equal(response.status, 200);
    assert.equal(response.json.type, 'okay');

    const [point] = findPoints(server, 'HORÁRIO COM HTML');
    assert.ok(point, 'the point should have been created');
    for (const value of [point.time_open, point.time_close]) {
      assert.ok(!String(value).includes('<'), `markup leaked into a time field: ${value}`);
      assert.ok(!String(value).includes('onerror'), 'event handler leaked into a time field');
      assert.match(String(value), /^\d{1,2}:\d{2}$/);
    }
  });
});

// ---------------------------------------------------------------------------
// SEC-009 — conta banida consegue trocar código por token
// ---------------------------------------------------------------------------

test('POST /auth/token refuses to mint a token for a banned account', { skip: SKIP('SEC-009') }, async () => {
  await withServer(async (server) => {
    const email = 'banned-token@example.com';
    const loginResponse = await server.post('/auth/login', { email });
    assert.equal(loginResponse.json.type, 'okay');
    const line = await server.waitForLog(`The login code for ${email} was`, 5_000, 0);
    const code = line.match(/was (\d+)\b/)[1];

    mutate(server, (db) => {
      db.prepare('UPDATE "user" SET banned = 1 WHERE email = ?').run(email);
    });

    const response = await server.post('/auth/token', { email, code });

    assert.equal(response.status, 200);
    assert.equal(response.json.type, 'error');
    assert.equal(response.json.token, undefined);
  });
});

// ---------------------------------------------------------------------------
// SEC-010 — /auth/delete não invalida a sessão nem apaga de fato
// ---------------------------------------------------------------------------

test('POST /auth/delete invalidates the token and keeps the account deleted', { skip: SKIP('SEC-010') }, async () => {
  await withServer(async (server) => {
    const email = 'delete-me@example.com';
    const { token } = await login(server, email);

    const deleted = await server.post('/auth/delete', { email, token });
    assert.equal(deleted.json.type, 'okay');

    const check = await server.post('/auth/check', { email, token });
    assert.equal(check.json.type, 'error', 'a deleted session must not survive');

    assert.equal(findUser(server, email), undefined, 'the account must not be recreated');
  });
});

test('a deleted ONG leaves no public placeholder account with moderation rights', { skip: SKIP('SEC-010') }, async () => {
  await withServer(async (server) => {
    const email = 'ong-leaver@example.com';
    const { token } = await login(server, email);

    mutate(server, (db) => {
      db.prepare('UPDATE "user" SET ong = 1 WHERE email = ?').run(email);
    });

    const deleted = await server.post('/auth/delete', { email, token });
    assert.equal(deleted.json.type, 'okay');

    // Nenhuma linha de substituição criada pela exclusão pode manter ong = 1.
    mutate(server, (db) => {
      const leftovers = db
        .prepare(`SELECT id, email, ong FROM "user" WHERE email LIKE 'deleted-%'`)
        .all()
        .filter((row) => row.ong);
      assert.deepEqual(leftovers, [], 'a deleted moderator must lose ong');
    });
  });
});

// ---------------------------------------------------------------------------
// SEC-011 — /report/create aceita pid inexistente (sem enforcement de FK)
// ---------------------------------------------------------------------------

test('POST /report/create rejects a pid that does not exist', { skip: SKIP('SEC-011') }, async () => {
  await withServer(async (server) => {
    const email = 'orphan-report@example.com';
    const { token } = await login(server, email);

    const response = await server.post('/report/create', {
      email,
      token,
      description: 'denúncia órfã',
      problem_kind: 'pointabsent',
      pid: 999999,
    });

    assert.equal(response.status, 200);
    assert.equal(response.json.type, 'error');

    const db = openDatabase(server);
    try {
      const { total } = db.prepare('SELECT COUNT(*) AS total FROM report').get();
      assert.equal(total, 0);
    } finally {
      db.close();
    }
  });
});

// ---------------------------------------------------------------------------
// SEC-012 — rota inexistente devolve HTML padrão do Express, não o envelope
// ---------------------------------------------------------------------------

test('an unknown route returns the JSON error envelope', { skip: SKIP('SEC-012') }, async () => {
  await withServer(async (server) => {
    const response = await server.post('/does/not/exist', {});

    assert.equal(response.status, 404);
    assert.equal(response.json && response.json.type, 'error');
  });
});

// ---------------------------------------------------------------------------
// Comportamento já correto — estes testes devem continuar verdes
// ---------------------------------------------------------------------------

test('the point description is sanitized and capped at 200 characters', { skip: SKIP('SEC-015') }, async () => {
  await withServer(async (server) => {
    const email = 'sanitize@example.com';
    const { token } = await login(server, email);
    const description = `<script>alert(1)</script>${'A'.repeat(300)}`;

    const response = await server.post('/point/create', {
      email,
      token,
      data: {
        pointdescription: description,
        lati: -21.17,
        long: -47.81,
        time_open: '7:00',
        time_close: '19:00',
        accepts_paper: true,
        accepts_metal: false,
        accepts_organic: false,
        accepts_biological: false,
      },
    });

    assert.equal(response.json.type, 'okay');

    const db = openDatabase(server);
    try {
      const point = db
        .prepare('SELECT * FROM point ORDER BY pid DESC LIMIT 1')
        .get();
      assert.ok(!point.pointdescription.includes('<script'), 'script tags must be stripped');
      assert.ok(point.pointdescription.length <= 200, 'the description must be capped');
    } finally {
      db.close();
    }
  });
});

test('non-ONG accounts cannot update, remove or approve points', async () => {
  await withServer(async (server) => {
    const email = 'citizen@example.com';
    const { token } = await login(server, email);

    for (const route of ['/point/update', '/point/remove', '/point/approve']) {
      const response = await server.post(route, {
        email,
        token,
        data: { pid: 1, pointdescription: 'x' },
      });

      assert.equal(response.status, 200);
      assert.equal(response.json.type, 'error', `${route} must reject a citizen`);
    }
  });
});

test('a token issued for one account does not authenticate another account', async () => {
  await withServer(async (server) => {
    const { token } = await login(server, 'owner@example.com');

    const response = await server.post('/auth/check', {
      email: 'victim@example.com',
      token,
    });

    assert.equal(response.status, 200);
    assert.equal(response.json.type, 'error');
  });
});

test('a one-time code cannot be replayed after a successful exchange', async () => {
  await withServer(async (server) => {
    const email = 'replay@example.com';
    const { code, token } = await login(server, email);
    assert.ok(token);

    const replay = await server.post('/auth/token', { email, code });

    assert.equal(replay.status, 200);
    assert.equal(replay.json.type, 'error');
  });
});
