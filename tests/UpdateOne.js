import assert from 'assert';
import {describe, it} from 'mocha';

import {Connection} from '..';
const db = new Connection();

describe('db.UpdateOne(...)', () => {
  var command = db.UpdateOne('users').setEqual({name: 'Chris'}).where('id = 1').returning('*');
  it('should equal literal string, same as db.Update(...)', () => {
    assert.equal(command.toSQL(), 'UPDATE users SET name = $name WHERE id = 1 RETURNING *');
    assert.deepEqual(command.parameters, {name: 'Chris'});
  });
});
