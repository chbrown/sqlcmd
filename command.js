/*jslint node: true */
var lib = require('./lib');
var util = require('util');

var Command = exports.Command = function(query, context) {
  this.query = lib.extend({}, {table: null}, query);
  this.context = context || {};
};
Command.prototype.prepare = function() {
  // this.join() will be very different for each kind of query / Command descendent
  var sql = this.join();
  var args = [];
  // this sql still has :variables in it, so we need to flatten it
  var context = this.context;
  sql = sql.replace(/:\w+/g, function(match) {
    var arg_name = match.slice(1);
    var arg = context[arg_name];
    if (arg === undefined) {
      var message = 'Cannot execute command with incomplete context. "' + arg_name + '" is missing.';
      // message += ' context = ' + util.inspect(context);
      throw new Error(message);
    }
    var index = args.push(arg);
    return '$' + index;
  });
  return { sql: sql, args: args };
};
Command.prototype.execute = function(connection, callback) {
  /**
  callback: function(err | null, rows | null)
    sent directly to connection.query()
  */
  var prepared_statement = this.prepare();
  connection.query(prepared_statement.sql, prepared_statement.args, callback);
};
Command.prototype._nextArg = function() {
  // returns a string that is not used in the current context
  for (var i = 0; i < 100; i++) {
    var name = 'arg' + i;
    if (this.context[name] === undefined) {
      return name;
    }
  }
  throw new Error('Exhausted first 100 free variable names');
};
Command.prototype._interpolate = function(sql, args) {
  /**
  Replace a sql string like 'name = ?' and args like ['chris']
  with a sql string like 'name = :arg1' while updating the context
  so that context.arg1 = 'chris'

  'interpolate' is probably not the best name.

  This function is mutable, and kind of private!
  */
  var self = this;
  // // any ? in the frag will be replaced by the appropriate index
  // if (sql.match(/\?/))
  //   return sql.replace(/\?/, '$' + this.addArg(arg));
  return sql.replace(/\?/g, function(match) {
    var arg_name = self._nextArg();
    self.context[arg_name] = args.shift();
    return ':' + arg_name;
  });
};
