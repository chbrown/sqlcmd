import assert from 'assert';
import {describe, it} from 'mocha';

import {Connection} from '..';
const db = new Connection();

describe('db.Update(...).setEqual(...).where(...)', () => {
  var command = db.Update('users').setEqual({name: 'Chris'}).where('id = 1').returning('*');
  it('should equal literal string', () => {
    assert.equal(command.toSQL(), 'UPDATE users SET name = $name WHERE id = 1 RETURNING *');
    assert.deepEqual(command.parameters, {name: 'Chris'});
  });
});

describe('db.Update(...).setEqual(...).whereEqual(...)', () => {
  var command = db.Update('users').setEqual({fn: 'Chris', ln: 'Brown'}).whereEqual({active: true}).returning('*');
  it('should equal literal string', () => {
    assert.equal(command.toSQL(), 'UPDATE users SET fn = $fn, ln = $ln WHERE active = $active RETURNING *');
    assert.deepEqual(command.parameters, {fn: 'Chris', ln: 'Brown', active: true});
  });
});

describe('db.UpdateOne(...)', () => {
  var command = db.UpdateOne('users').setEqual({name: 'Chris'}).where('id = 1').returning('*');
  it('should equal literal string, same as db.Update(...)', () => {
    assert.equal(command.toSQL(), 'UPDATE users SET name = $name WHERE id = 1 RETURNING *');
    assert.deepEqual(command.parameters, {name: 'Chris'});
  });
});
