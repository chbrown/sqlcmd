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

describe('db.Select(...).limit(...).orderBy(...)', function() {
  var command = db.Select('users').limit(1).orderBy('lastname ASC', 'firstname ASC');
  it('should equal literal string', function() {
    assert.equal(command.toSQL(), 'SELECT * FROM users ORDER BY lastname ASC, firstname ASC LIMIT $limit');
    assert.deepEqual(command.parameters, {limit: 1});
  });
});

describe('db.Select(...).groupBy(...)', function() {
  var command = db.Select('users').add('COUNT(lastname)').groupBy('lastname');
  it('should equal literal string', function() {
    assert.equal(command.toSQL(), 'SELECT COUNT(lastname) FROM users GROUP BY lastname');
  });
});

describe('db.Select(...).offset(...).limit(...)', function() {
  var command = db.Select('users').offset(250).limit(25);
  it('should equal literal string', function() {
    assert.equal(command.toSQL(), 'SELECT * FROM users LIMIT $limit OFFSET $offset');
    assert.deepEqual(command.parameters, {offset: 250, limit: 25});
  });
});
