'use strict';

const { spawn } = require('node:child_process');
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const http = require('node:http');
const net = require('node:net');
const os = require('node:os');
const path = require('node:path');

const SERVER_PATH = path.resolve(__dirname, '../../src/server.js');
const ADMIN_EMAIL = 'admin@example.com';

async function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();

    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      server.close((error) => {
        if (error) {
          reject(error);
        } else {
          resolve(port);
        }
      });
    });
  });
}

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

function rawRequest({ port, method, requestPath, body, localAddress, headers = {} }) {
  return new Promise((resolve, reject) => {
    const payload = body === undefined ? undefined : JSON.stringify(body);
    const requestHeaders = { ...headers };

    if (payload !== undefined) {
      requestHeaders['content-type'] = requestHeaders['content-type'] || 'application/json';
      requestHeaders['content-length'] = Buffer.byteLength(payload);
    }

    const request = http.request(
      {
        host: '127.0.0.1',
        port,
        method,
        path: requestPath,
        localAddress,
        headers: requestHeaders,
        timeout: 10_000,
      },
      (response) => {
        let text = '';
        response.setEncoding('utf8');
        response.on('data', (chunk) => {
          text += chunk;
        });
        response.on('end', () => {
          resolve({
            status: response.statusCode,
            headers: response.headers,
            text,
            json: parseJson(text),
          });
        });
      },
    );

    request.on('timeout', () => {
      request.destroy(new Error(`Request to ${requestPath} timed out`));
    });
    request.on('error', reject);

    if (payload !== undefined) {
      request.write(payload);
    }

    request.end();
  });
}

class ApiServer {
  constructor({ child, directory, port, ownsDirectory }) {
    this.child = child;
    this.directory = directory;
    this.port = port;
    this.dbPath = path.join(directory, 'recicladb.sqlite');
    this.ownsDirectory = ownsDirectory;
    this.logLines = [];
    this.partialLine = '';
    this.waiters = new Set();
    this.nextLocalAddress = 10;
    this.exited = false;
  }

  get baseUrl() {
    return `http://127.0.0.1:${this.port}`;
  }

  _nextAddress() {
    const address = `127.0.0.${(this.nextLocalAddress % 240) + 10}`;
    this.nextLocalAddress += 1;
    return address;
  }

  _recordOutput(chunk) {
    this.partialLine += chunk.toString();
    const lines = this.partialLine.split('\n');
    this.partialLine = lines.pop() || '';

    for (const line of lines) {
      if (!line) {
        continue;
      }

      this.logLines.push(line);
      const index = this.logLines.length - 1;
      for (const waiter of this.waiters) {
        waiter(line, index);
      }
    }
  }

  /**
   * Wait until a log line matching `pattern` is emitted.
   * `pattern` may be a RegExp or a substring. Pass `fromIndex` to ignore lines
   * that were already present before an action started.
   */
  waitForLog(pattern, timeout = 5_000, fromIndex = 0) {
    const matches = (line) => {
      if (pattern instanceof RegExp) {
        return pattern.test(line);
      }

      return line.includes(pattern);
    };

    const existing = this.logLines
      .slice(fromIndex)
      .reverse()
      .find((line) => matches(line));
    if (existing) {
      return Promise.resolve(existing);
    }

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.waiters.delete(waiter);
        reject(
          new Error(
            `Timed out waiting for API log ${String(pattern)}.\nLogs:\n${this.logLines.join('\n')}`,
          ),
        );
      }, timeout);

      const waiter = (line, index) => {
        if (index < fromIndex || !matches(line)) {
          return;
        }

        clearTimeout(timer);
        this.waiters.delete(waiter);
        resolve(line);
      };

      this.waiters.add(waiter);
    });
  }

  request({ path: requestPath, method = 'GET', body, localAddress, headers } = {}) {
    if (this.exited) {
      return Promise.reject(new Error('The API server has already exited'));
    }

    return rawRequest({
      port: this.port,
      method,
      requestPath,
      body,
      localAddress: localAddress || this._nextAddress(),
      headers,
    });
  }

  get(requestPath, options = {}) {
    return this.request({ ...options, path: requestPath, method: 'GET' });
  }

  post(requestPath, body, options = {}) {
    return this.request({ ...options, path: requestPath, method: 'POST', body });
  }

  async close() {
    if (!this.child || this.exited) {
      if (this.ownsDirectory) {
        await fsp.rm(this.directory, { recursive: true, force: true });
      }
      return;
    }

    this.exited = true;

    const waitForExit = new Promise((resolve) => {
      if (this.child.exitCode !== null || this.child.signalCode !== null) {
        resolve();
        return;
      }

      this.child.once('exit', resolve);
    });

    this.child.kill('SIGTERM');

    const killTimer = setTimeout(() => {
      if (this.child.exitCode === null && this.child.signalCode === null) {
        this.child.kill('SIGKILL');
      }
    }, 3_000);

    await waitForExit;
    clearTimeout(killTimer);

    if (this.ownsDirectory) {
      await fsp.rm(this.directory, { recursive: true, force: true });
    }
  }
}

function captureChild(child, server) {
  child.stdout.on('data', (chunk) => server._recordOutput(chunk));
  child.stderr.on('data', (chunk) => server._recordOutput(chunk));
}

async function startApiServer(options = {}) {
  const ownsDirectory = !options.directory;
  const directory =
    options.directory || (await fsp.mkdtemp(path.join(os.tmpdir(), 'reciclarp-api-')));
  const port = options.port || (await getFreePort());
  const environment = {
    PATH: process.env.PATH,
    HOME: process.env.HOME,
    RECICLA_API_PORT: String(port),
    RECICLA_ADMIN_EMAIL: options.adminEmail || ADMIN_EMAIL,
    ...options.env,
  };

  delete environment.RECICLA_RESEND_SECRET;

  const child = spawn(process.execPath, [SERVER_PATH], {
    cwd: directory,
    env: environment,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  const server = new ApiServer({ child, directory, port, ownsDirectory });
  captureChild(child, server);

  const earlyExit = new Promise((_, reject) => {
    child.once('exit', (code, signal) => {
      reject(
        new Error(
          `API server exited unexpectedly (code=${code}, signal=${signal}).\nLogs:\n${server.logLines.join('\n')}`,
        ),
      );
    });
  });

  const ready = (async () => {
    const deadline = Date.now() + 10_000;

    while (Date.now() < deadline) {
      try {
        const response = await server.get('/api/ping');
        if (response.status === 200) {
          return;
        }
      } catch {
        // The server is still starting.
      }

      await new Promise((resolve) => setTimeout(resolve, 25));
    }

    throw new Error(`API server did not become ready.\nLogs:\n${server.logLines.join('\n')}`);
  })();

  try {
    await Promise.race([ready, earlyExit]);
  } catch (error) {
    await server.close();
    throw error;
  }

  // Do not keep an unhandled rejection around once startup completed.
  earlyExit.catch(() => {});

  return server;
}

function openDatabase(server, options = { readonly: true }) {
  const Database = require('better-sqlite3');
  return new Database(server.dbPath, options);
}

module.exports = {
  ADMIN_EMAIL,
  startApiServer,
  openDatabase,
};
