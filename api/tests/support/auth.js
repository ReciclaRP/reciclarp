'use strict';

/**
 * Request a one-time code and exchange it for a session token.
 *
 * Passing an explicit localAddress is useful when a test needs several
 * requests to share one rate-limit bucket. Otherwise the harness assigns each
 * request its own loopback address so unrelated tests never interfere.
 */
async function login(server, email, { localAddress } = {}) {
  const options = localAddress ? { localAddress } : {};
  const logStart = server.logLines.length;
  const loginResponse = await server.post('/auth/login', { email }, options);

  let code;
  if (loginResponse.json && loginResponse.json.type === 'okay') {
    const line = await server.waitForLog(`The login code for ${email} was`, 5_000, logStart);
    const match = line.match(/was (\d+)\b/);
    if (!match) {
      throw new Error(`Could not parse the one-time code from log line: ${line}`);
    }
    code = match[1];
  }

  const tokenResponse = await server.post('/auth/token', { email, code }, options);

  return {
    loginResponse,
    code,
    tokenResponse,
    token: tokenResponse.json && tokenResponse.json.token,
  };
}

module.exports = { login };
