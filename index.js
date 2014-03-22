/*jslint node: true */
var pg = require('pg');

var Select = require('./commands/select').Select;
var Insert = require('./commands/insert').Insert;
var Update = require('./commands/update').Update;
var Delete = require('./commands/delete').Delete;

var Connection = exports.Connection = function(options) {
  /** configure connection with options to be used for each query */
  this.options = options;
};
Connection.prototype.connect = function(callback) {
  /**
  Very shallow layer to run pg.connect.

  callback: function(err, client, done) { ... }

  The user is responsible for running done() when done!
  */
  pg.connect(this.options, callback);
};
Connection.prototype.query = function(sql, args, callback) {
  /** run sql query on configured SQL connection

  callback: function(Error | null, [Object] | null)
  */
  var logger = this.logger;
  pg.connect(this.options, function(err, client, done) {
    if (err) return callback ? callback(err) : err;

    if (logger) logger.info('Executing SQL "%s" with variables: %j', sql, args);
    client.query(sql, args, function(err, result) {
      if (logger) logger.debug('Query result: %j', result);
      done();
      if (callback) {
        callback(err, result ? result.rows : null);
      }
    });
  });
};
// do this better:
Connection.prototype.Select = function(from) {
  var command = new Select(from);
  command.connection = this;
  return command;
};
Connection.prototype.Insert = function(into) {
  var command = new Insert(into);
  command.connection = this;
  return command;
};
Connection.prototype.Update = function(table) {
  var command = new Update(table);
  command.connection = this;
  return command;
};
Connection.prototype.Delete = function(from) {
  var command = new Delete(from);
  command.connection = this;
  return command;
};
