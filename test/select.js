/*jslint node: true */ /*globals describe, it */
var assert = require('assert');

var db = require('../');

describe('db.Select(...)', function() {
  var command = db.Select('users');
  it('should equal literal string', function() {
    assert.equal(command.toSQL(), 'SELECT * FROM users');
  });
  it('should not be affected by limit() call', function() {
    var modified_command = command.limit(100);
    assert.equal(command.toSQL(), 'SELECT * FROM users');
  });
});

describe('db.Select(...).add(...).where(...)', function() {
  var command = db.Select('users').add('id').where('active = TRUE');
  it('should equal literal string', function() {
    assert.equal(command.toSQL(), 'SELECT id FROM users WHERE active = TRUE');
  });
});

describe('db.Select(...).where(...)', function() {
  var command = db.Select('users').where('name = ?', 'Chris');
  it('should equal literal string', function() {
    assert.equal(command.toSQL(), 'SELECT * FROM users WHERE name = $1');
    assert.deepEqual(command.parameters, {'1': 'Chris'});
  });
});
