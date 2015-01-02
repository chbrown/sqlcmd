/*jslint node: true */ /*globals describe, it */
var assert = require('assert');
var db = require('../');

describe('db.Update(...).setEqual(...).where(...)', function() {
  var command = db.Update('users').setEqual({name: 'Chris'}).where('id = 1').returning('*');
  it('should equal literal string', function() {
    assert.equal(command.toSQL(), 'UPDATE users SET name = $name WHERE id = 1 RETURNING *');
    assert.deepEqual(command.parameters, {name: 'Chris'});
  });
});

describe('db.Update(...).setEqual(...).whereEqual(...)', function() {
  var command = db.Update('users').setEqual({fn: 'Chris', ln: 'Brown'}).whereEqual({active: true}).returning('*');
  it('should equal literal string', function() {
    assert.equal(command.toSQL(), 'UPDATE users SET fn = $fn, ln = $ln WHERE active = $active RETURNING *');
    assert.deepEqual(command.parameters, {fn: 'Chris', ln: 'Brown', active: true});
  });
});
