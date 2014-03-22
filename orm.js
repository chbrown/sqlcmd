/*jslint node: true */
var util = require('util');

var lib = require('./lib');
var Select = require('./commands/select').Select;
var Delete = require('./commands/delete').Delete;

var Record = function(obj) {
  lib.extend(this, obj);
};
Record.all = function(pattern, callback) {
  /** Find all records that precisely match pattern.

  callback(Error)
  callback(null, records | [])

  Be careful! This susceptible to injection -- `pattern`'s keys are not escaped.
  */
  var Constructor = this;
  this.connection.Select(this.table)
  .whereEqual(pattern)
  .execute(function(err, rows) {
    if (err) return callback(err);

    var records = rows.map(function(row) {
      return new Constructor(row);
    });
    callback(null, records);
  });
};
Record.first = function(pattern, callback) {
  /** Find the first record that matches pattern, or null.

  callback(Error)
  callback(null, record | null)

  Be careful! susceptible to injection -- pattern's keys are not escaped.
  */
  var Constructor = this;
  this.connection.Select(this.table)
  .limit(1)
  .whereEqual(pattern)
  .execute(function(err, rows) {
    if (err) return callback(err);
    if (rows.length === 0) return callback(null, null);

    var record = new Constructor(rows[0]);
    callback(null, record);
  });
};
Record.one = function(pattern, callback) {
  /** Find the first record that matches pattern, calling back with an error if none can be found.

  `from()` is like `first()`, but considers no results to be an error.

  callback(Error)
  callback(null, record)
  */
  var Constructor = this;
  this.first(pattern, function(err, record) {
    if (err) return callback(err);
    if (record === null) {
      var pattern_string = util.inspect(pattern);
      var message = 'Could not find match in ' + Constructor.table + '.';
      return callback(new Error(message));
    }

    callback(null, record);
  });
};
Record.delete = function(pattern, callback) {
  /** Delete the records matching the given pattern.
  callback(Error | null)
  */
  this.connection.Delete(this.table)
  .whereEqual(pattern)
  .execute(callback);
};

var ORM = exports.ORM = function(connection) {
  this.connection = connection;
};
ORM.prototype.model = function(table, columns) {
  var Constructor = function(obj) {
    Record.call(this, obj);
  };
  Constructor.table = table;
  Constructor.columns = columns;
  Constructor.connection = this.connection;
  lib.inherit(Constructor, Record);

  return Constructor;
};
