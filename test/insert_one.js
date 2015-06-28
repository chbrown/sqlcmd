/*globals describe, it */
var assert = require('assert');

var db = require('../');

describe('db.InsertOne(...)', function() {
  var command = db.InsertOne('users').add('name', 'Chris').returning('*');
  it('should equal literal string, same as db.Insert(...)', function() {
    assert.equal(command.toSQL(), 'INSERT INTO users (name) VALUES ($name) RETURNING *');
  });
});
