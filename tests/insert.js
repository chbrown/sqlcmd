import assert from 'assert';
import {describe, it} from 'mocha';

import {Connection} from '..';
const db = new Connection();

describe('db.Insert(...).add(...)', () => {
  var command = db.Insert('users').add('name', 'Chris').returning('*');
  it('should equal literal string', () => {
    assert.equal(command.toSQL(), 'INSERT INTO users (name) VALUES ($name) RETURNING *');
    assert.deepEqual(command.parameters, {name: 'Chris'});
  });
});

describe('db.InsertOne(...)', () => {
  var command = db.InsertOne('users').add('name', 'Chris').returning('*');
  it('should equal literal string, same as db.Insert(...)', () => {
    assert.equal(command.toSQL(), 'INSERT INTO users (name) VALUES ($name) RETURNING *');
  });
});
