/*globals describe, it */
var assert = require('assert');
var db = require('../');

describe('db.Insert(...).add(...)', function() {
  var command = db.Insert('users').add('name', 'Chris').returning('*');
  it('should equal literal string', function() {
    assert.equal(command.toSQL(), 'INSERT INTO users (name) VALUES ($name) RETURNING *');
    assert.deepEqual(command.parameters, {name: 'Chris'});
  });
});
