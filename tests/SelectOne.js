import assert from 'assert';
import {describe, it} from 'mocha';

import {Connection} from '..';
const db = new Connection();

describe('db.SelectOne(...)', () => {
  var command = db.SelectOne('users');
  it('should equal literal string', () => {
    assert.equal(command.toSQL(), 'SELECT * FROM users LIMIT 1');
  });
});
