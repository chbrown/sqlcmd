/*jslint node: true */
var pg = require('pg');
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
      if (err && logger) logger.error('Query error: %j', err);
      else if (logger) logger.debug('Query result: %j', result);
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

Connection.prototype.executeSQLFile = function(filepath, callback) {
  /** Read SQL from an arbitrary filepath and execute it.

  If you thought connection.createDatabase was unsafe, you got another think coming.

      callback: function(error?: Error)
  */
  var self = this;
  fs.readFile(filepath, {encoding: 'utf8'}, function(err, sql) {
    if (err) return callback(err);
    self.query(sql, [], callback);
  });
};

// Database commands (uses same config except with 'postgres' database
Connection.prototype.postgresConnection = function(callback) {
  var postgres_options = lib.extend({}, this.options, {database: 'postgres'});
  var connection = new Connection(postgres_options);
  connection.logger = this.logger;
  return connection;
};
Connection.prototype.databaseExists = function(callback) {
  /** Check if the database used by this connection exists.
  This method connects to the special 'postgres' database with the same connection credentials.

      callback: function(err, exists: Boolean)
  */
  var postgres_db = this.postgresConnection();
  postgres_db.Select('pg_catalog.pg_database')
  .where('datname = ?', this.options.database)
  .execute(function(err, rows) {
    if (err) return callback(err);

    callback(null, rows.length > 0);
  });
  postgres_db.end();
};

// CREATE DATABASE and helper
Connection.prototype.createDatabase = function(callback) {
  /** Create the database used by this connection.

  We can't specify the database name as an argument, so we just put it into the string raw.
  This is unsafe, of course, but if you want to break your own computer, go for it.

      callback: function(error?: Error)
  */
  var postgres_db = this.postgresConnection();
  postgres_db.query('CREATE DATABASE "' + this.options.database + '"', [], callback);
  postgres_db.end();
};
Connection.prototype.createDatabaseIfNotExists = function(callback) {
  /** Check if the database exists.
  1. If it does not exist, create it.
  2. If it already exists, do nothing.

      callback: function(error: Error, created?: boolean)
  */
  var self = this;
  this.databaseExists(function(err, exists) {
    if (err) return callback(err);
    if (exists) return callback(null, false);

    self.createDatabase(function(err) {
      callback(err, err ? undefined : true);
    });
  });
};

// DROP DATABASE and helper
Connection.prototype.dropDatabase = function(callback) {
  /** Drop the database used by this connection.

  Vulnerable to injection via the database name!

      callback: function(error?: Error)
  */
  var postgres_db = this.postgresConnection();
  postgres_db.query('DROP DATABASE "' + this.options.database + '"', [], callback);
  postgres_db.end();
};
Connection.prototype.dropDatabaseIfExists = function(callback) {
  /** Check if the database exists.
  1. If it does not exist, do nothing.
  2. If it does exist, drop it.

      callback: function(error: Error, dropped?: boolean)
  */
  var self = this;
  this.databaseExists(function(err, exists) {
    if (err) return callback(err);
    if (!exists) return callback(null, false);

    self.dropDatabase(function(err) {
      callback(err, err ? undefined : true);
    });
  });
};

// all-in-one
Connection.prototype.initializeDatabase = function(sql_filepath, callback) {
  /** Create the database if it doesn't exist and execute the specified sql on it.

  callback: function(error: Error, initialized?: boolean)
  */
  var self = this;
  this.createDatabaseIfNotExists(function(err, exists) {
    if (err) return callback(err);
    if (exists) return callback(null, false);
    self.executeSQLFile(sql_filepath, function(err) {
      callback(err, err ? undefined : true);
    });
  });
};
