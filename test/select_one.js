/*globals describe, it */
var assert = require('assert');

var db = require('../');

describe('db.SelectOne(...)', function() {
  var command = db.SelectOne('users');
  it('should equal literal string', function() {
    assert.equal(command.toSQL(), 'SELECT * FROM users LIMIT 1');
  });
});
