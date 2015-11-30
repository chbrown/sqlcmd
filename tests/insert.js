import assert from 'assert';
import {describe, it} from 'mocha';

var db = require('../');

describe('db.Insert(...).add(...)', () => {
  var command = db.Insert('users').add('name', 'Chris').returning('*');
  it('should equal literal string', () => {
    assert.equal(command.toSQL(), 'INSERT INTO users (name) VALUES ($name) RETURNING *');
    assert.deepEqual(command.parameters, {name: 'Chris'});
  });
});
