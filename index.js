/*jslint node: true */
var pg = require('pg.js');
var fs = require('fs');
var lib = require('./lib');

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
Connection.prototype.end = function() {
  pg.end();
};
Connection.prototype.query = function(sql, args, callback) {
  /** Run sql query on configured SQL connection

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

Connection.prototype.databaseExists = function(callback) {
  /** Check if the database used by this connection exists.
  This method connects to the special 'postgres' database with the same connection credentials.

      callback: function(err, exists: Boolean)
  */
  var postgres_options = lib.extend({}, this.options, {database: 'postgres'});
  var db = new Connection(postgres_options);
  db.Select('pg_catalog.pg_database')
  .where('datname = ?', this.options.database)
  .execute(function(err, rows) {
    if (err) return callback(err);

    callback(null, rows.length > 0);
  });
  db.end();
};

Connection.prototype.createDatabase = function(callback) {
  /** Create the database used by this connection.

  We can't specify the database name as an argument, so we just put it into the string raw.
  This is unsafe, of course, but if you want to break your own computer, go for it.

      callback: function(err)
  */
  var postgres_options = lib.extend({}, this.options, {database: 'postgres'});
  var db = new Connection(postgres_options);
  db.query('CREATE DATABASE "' + this.options.database + '"', [], callback);
  db.end();
};

Connection.prototype.dropDatabase = function(callback) {
  /** Drop the database used by this connection.

  Subject to injection!

      callback: function(err)
  */
  var postgres_options = lib.extend({}, this.options, {database: 'postgres'});
  var db = new Connection(postgres_options);
  db.query('DROP DATABASE "' + this.options.database + '"', [], callback);
  db.end();
};

Connection.prototype.executeSQLFile = function(filepath, callback) {
  /** Read SQL from an arbitrary filepath and execute it.

  If you thought connection.create was unsafe, you got another think coming.

      callback: function(err)
  */
  var self = this;
  fs.readFile(filepath, {encoding: 'utf8'}, function (err, sql) {
    if (err) return callback(err);
    self.query(sql, [], callback);
  });
};
