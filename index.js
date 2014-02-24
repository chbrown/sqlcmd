/*jslint node: true */
var pg = require('pg');

var Connection = function(options) {
  this.options = options;
};
Connection.prototype.query = exports.query = function(sql, args, callback) {
  /** run sql query on pre-configured SQL connection

  `callback`: function(Error | null, [Object] | null)
  */
  var logger = this.logger;
  // logger.debug('Connecting to PostgresSQL as %s:%s (%s)',
  //   process.getgid(), process.getuid(), process.env.USER);
  pg.connect(this.options, function(err, client, done) {
    if (err) return callback ? callback(err) : err;

    if (logger) logger.debug('Executing SQL "%s" with variables: %j', sql, args);
    client.query(sql, args, function(err, result) {
      if (logger) logger.debug('Query result: %j', result);
      done();
      if (callback) {
        callback(err, result ? result.rows : null);
      }
    });
  });
};
// Connection.prototype.Select;

var singleton = module.exports = new Connection({
  host: '/tmp',
  database: 'postgres',
});
singleton.configure = function(options) {
  // _.extend(singleton.options, options);
  singleton.options = options;
};
singleton.Connection = Connection;
singleton.Select = require('./select').Select;
singleton.Insert = require('./insert').Insert;
singleton.Update = require('./update').Update;
singleton.Delete = require('./delete').Delete;
