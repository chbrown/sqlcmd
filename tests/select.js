import assert from 'assert';
import {describe, it} from 'mocha';

import {Connection} from '..';
const db = new Connection();

describe('db.Select(...)', () => {
  var command = db.Select('users');
  it('should equal literal string', () => {
    assert.equal(command.toSQL(), 'SELECT * FROM users');
  });
  it('should not be affected by limit() call', () => {
    command.limit(100);
    assert.equal(command.toSQL(), 'SELECT * FROM users');
  });
});

describe('db.Select(...).add(...).where(...)', () => {
  var command = db.Select('users').add('id').where('active = TRUE');
  it('should equal literal string', () => {
    assert.equal(command.toSQL(), 'SELECT id FROM users WHERE active = TRUE');
  });
});

describe('db.Select(...).where(...)', () => {
  var command = db.Select('users').where('name = ?', 'Chris');
  it('should equal literal string', () => {
    assert.equal(command.toSQL(), 'SELECT * FROM users WHERE name = $1');
    assert.deepEqual(command.parameters, {'1': 'Chris'});
  });
});

describe('db.Select(...).limit(...).orderBy(...)', () => {
  var command = db.Select('users').limit(1).orderBy('lastname ASC', 'firstname ASC');
  it('should equal literal string', () => {
    assert.equal(command.toSQL(), 'SELECT * FROM users ORDER BY lastname ASC, firstname ASC LIMIT $limit');
    assert.deepEqual(command.parameters, {limit: 1});
  });
});

describe('db.Select(...).groupBy(...)', () => {
  var command = db.Select('users').add('COUNT(lastname)').groupBy('lastname');
  it('should equal literal string', () => {
    assert.equal(command.toSQL(), 'SELECT COUNT(lastname) FROM users GROUP BY lastname');
  });
});

describe('db.Select(...).offset(...).limit(...)', () => {
  var command = db.Select('users').offset(250).limit(25);
  it('should equal literal string', () => {
    assert.equal(command.toSQL(), 'SELECT * FROM users LIMIT $limit OFFSET $offset');
    assert.deepEqual(command.parameters, {offset: 250, limit: 25});
  });
});

describe('db.SelectOne(...)', () => {
  var command = db.SelectOne('users');
  it('should equal literal string', () => {
    assert.equal(command.toSQL(), 'SELECT * FROM users LIMIT 1');
  });
});
