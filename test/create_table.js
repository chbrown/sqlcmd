/*globals describe, it */
var assert = require('assert');

var db = require('../');

describe('db.CreateTable(...)', function() {
  var command = db.CreateTable('users');
  it('should equal literal string', function() {
    assert.equal(command.toSQL(), 'CREATE TABLE users (  )');
  });
  it('should not be affected by add() call', function() {
    var modified_command = command.add(['modified DATETIME']);
    assert.equal(command.toSQL(), 'CREATE TABLE users (  )');
  });
  it('should be affected by _add() call', function() {
    command._add(['modified DATETIME']);
    assert.equal(command.toSQL(), 'CREATE TABLE users ( modified DATETIME )');
  });
});

describe('db.CreateTable(...).add(...)', function() {
  var command = db.CreateTable('users').add([
    'id SERIAL PRIMARY KEY',
    'created TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
  ]);
  it('should equal literal string', function() {
    assert.equal(command.toSQL(),
      'CREATE TABLE users ( id SERIAL PRIMARY KEY, created TIMESTAMP DEFAULT CURRENT_TIMESTAMP )');
  });
  it('modified version should have extra column', function() {
    var modified_command = command.add(['modified DATETIME']);
    assert.equal(modified_command.toSQL(),
      'CREATE TABLE users ( id SERIAL PRIMARY KEY, created TIMESTAMP DEFAULT CURRENT_TIMESTAMP, modified DATETIME )');
  });
});
