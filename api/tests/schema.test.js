'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  __RECICLA_ADMIN_SEED,
  __RECICLA_DEFAULT_SCHEMA,
  __RECICLA_POINT_SEED,
} = require('../src/db/schema.js');

test('default schema declares the user, point, and report tables', () => {
  const schema = __RECICLA_DEFAULT_SCHEMA();

  assert.match(schema, /CREATE TABLE user\s*\(/);
  assert.match(schema, /CREATE TABLE point\s*\(/);
  assert.match(schema, /CREATE TABLE report\s*\(/);
});

test('the user table requires unique, non-null e-mail addresses', () => {
  const schema = __RECICLA_DEFAULT_SCHEMA();

  assert.match(schema, /email VARCHAR\(160\) NOT NULL UNIQUE/);
  assert.match(schema, /banned BOOLEAN NOT NULL DEFAULT 0/);
  assert.match(schema, /validated BOOLEAN NOT NULL DEFAULT 0/);
  assert.match(schema, /ong BOOLEAN NOT NULL DEFAULT 0/);
});

test('points and reports reference their owners through foreign keys', () => {
  const schema = __RECICLA_DEFAULT_SCHEMA();

  assert.match(schema, /FOREIGN KEY\(creator\) REFERENCES user\(id\)/);
  assert.match(schema, /FOREIGN KEY\(uid\) REFERENCES user\(id\)/);
  assert.match(schema, /FOREIGN KEY\(pid\) REFERENCES point\(pid\)/);
});

test('the admin seed is an ONG account with a known e-mail', () => {
  assert.deepEqual(__RECICLA_ADMIN_SEED(), ['Admin', 0, 1, 1]);
});

test('the point seed contains eight approved ecopontos created by the admin', () => {
  const points = __RECICLA_POINT_SEED();

  assert.equal(points.length, 8);

  for (const point of points) {
    assert.equal(point.length, 11);
    assert.equal(typeof point[0], 'string');
    assert.ok(point[0].length > 0);
    assert.equal(typeof point[1], 'number');
    assert.equal(typeof point[2], 'number');
    assert.equal(typeof point[3], 'string');
    assert.equal(typeof point[4], 'string');
    for (let index = 5; index <= 9; index += 1) {
      assert.ok(point[index] === 0 || point[index] === 1, `expected point[${index}] to be a flag`);
    }
    assert.equal(point[9], 1, 'seeded points should be approved');
    assert.equal(point[10], 0, 'seeded points should belong to the admin account');
  }
});

test('the seeded points are inside Ribeirão Preto and have unique names', () => {
  const points = __RECICLA_POINT_SEED();
  const names = new Set();

  for (const point of points) {
    assert.ok(point[1] >= -21.35 && point[1] <= -21.0, `${point[0]} latitude out of range`);
    assert.ok(point[2] >= -48.0 && point[2] <= -47.6, `${point[0]} longitude out of range`);
    names.add(point[0]);
  }

  assert.equal(names.size, points.length);
});
