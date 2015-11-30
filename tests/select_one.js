import assert from 'assert';
import {describe, it} from 'mocha';

var db = require('../');

describe('db.SelectOne(...)', () => {
  var command = db.SelectOne('users');
  it('should equal literal string', () => {
    assert.equal(command.toSQL(), 'SELECT * FROM users LIMIT 1');
  });
});
