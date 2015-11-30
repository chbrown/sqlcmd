import assert from 'assert';
import {describe, it} from 'mocha';

var db = require('../');

describe('db.Delete(...).where(...)', () => {
  var command = db.Delete('users').where('active = FALSE');
  it('should equal literal string', () => {
    assert.equal(command.toSQL(), 'DELETE FROM users WHERE active = FALSE');
  });
});

describe('db.Delete(...).whereEqual(...)', () => {
  var command = db.Delete('users').whereEqual({name: 'Chris'});
  it('should equal literal string', () => {
    assert.equal(command.toSQL(), 'DELETE FROM users WHERE name = $name');
    assert.deepEqual(command.parameters, {name: 'Chris'});
  });
});
