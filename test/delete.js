/*jslint node: true */ /*globals describe, it */
var assert = require('assert');
var db = require('../');

describe('db.Delete(...).where(...)', function() {
  var command = db.Delete('users').where('active = FALSE');
  it('should equal literal string', function() {
    assert.equal(command.toSQL(), 'DELETE FROM users WHERE active = FALSE');
  });
});

describe('db.Delete(...).whereEqual(...)', function() {
  var command = db.Delete('users').whereEqual({name: 'Chris'});
  it('should equal literal string', function() {
    assert.equal(command.toSQL(), 'DELETE FROM users WHERE name = $name');
    assert.deepEqual(command.parameters, {name: 'Chris'});
  });
});
