/*jslint node: true */
var util = require('util');

function serializeSqlValue(raw) {
  // JSON.stringify doesn't quite work for all values because it uses double quotes
  if (raw === null) {
    return 'NULL';
  }
  else if (raw === undefined) {
    throw new Error('undefined has no SQL value');
  }
  else if (typeof raw == 'number') {
    return raw.toString();
  }
  else {
    // multiline strings are fine in SQL; all we care about is escaping the quotes
    var string = (typeof raw == 'string') ? raw : JSON.stringify(raw);
    return "'" + string.replace(/'/g, "''") + "'";
  }
}

var Command = exports.Command = function() {
  this.context = {};
};
Command.immutable = function(methods) {
  var Constructor = this;
  methods.forEach(function(method) {
    Constructor.prototype[method] = function() {
      return Constructor.prototype['_' + method].apply(this.clone(), arguments);
    };
  });
};

Command.prototype._nextArg = function() {
  // returns a string that is not used in the current context
  for (var i = 0; i < 1000; i++) {
    var name = 'arg' + i;
    if (this.context[name] === undefined) {
      return name;
    }
  }
  throw new Error('Exhausted first 1000 free variable names');
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
Command.prototype._prepare = function() {
  // this._sql() will be very different for each kind of query / Command descendent
  var sql = this._sql();
  var args = [];
  // this sql still has :variables in it, so we need to flatten it
  var context = this.context;
  sql = sql.replace(/:\w+/g, function(match) {
    var arg_name = match.slice(1);
    var arg = context[arg_name];
    if (arg === undefined) {
      var message = 'Cannot execute command with incomplete context. "' + arg_name + '" is missing.';
      message += ' sql = "' + sql + '" context = ' + util.inspect(context);
      throw new Error(message);
    }
    var index = args.push(arg);
    return '$' + index;
  });
  return { sql: sql, args: args };
};
Command.prototype.toUnsafeSQL = function() {
  /** Unsafe! Doesn't even try to protect against SQL injection */
  var prepared_statement = this._prepare();
  return prepared_statement.sql.replace(/\$(\d+)/g, function(m, group1) {
    var index = parseInt(group1, 10) - 1;
    var value = prepared_statement.args[index];
    return serializeSqlValue(value);
  });
};

Command.prototype.execute = function(callback) {
  /**
  callback: function(err | null, rows | null)
    sent directly to this.connection.query()
    (what if there is no connection available?)
  */
  var prepared_statement = this._prepare();
  this.connection.query(prepared_statement.sql, prepared_statement.args, callback);
};
