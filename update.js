/*jslint node: true */
var util = require('util');
var command = require('./command');
var lib = require('./lib');

var Update = exports.Update = function(query, context) {
  command.Command.call(this, query, context);
  lib.extend(this.query, {
    eqs: [], // equations / equalities (column-expression pairs)
    wheres: [],
  }, query);
};
util.inherits(Update, command.Command);

Update.prototype.clone = function() {
  // returns semi-shallow clone; should be deep *enough*
  var new_query = {
    table: this.query.table,
    eqs: lib.clone(this.query.eqs),
    wheres: lib.clone(this.query.wheres),
  };
  var new_context = lib.clone(this.context);
  return new Update(new_query, new_context);
};
Update.prototype.join = function() {
  var parts = ['UPDATE', this.query.table];
  // e.g., 'UPDATE users SET ip = $1, user_agent = $2 WHERE id = $3';
  if (this.query.eqs.length > 0) {
    parts.push('SET', this.query.eqs.join(', '));
  }
  if (this.query.wheres.length > 0) {
    parts.push('WHERE ' + this.query.wheres.join(' AND '));
  }
  return parts.join(' ');
};
Update.prototype.where = function(sql /*, args... */) {
  /** Immutable */
  var update = this.clone();
  var args = lib.slice(arguments, 1);
  if (args.length > 0) {
    sql = update._interpolate(sql, args);
  }
  update.query.wheres.push(sql);
  return update;
};

Update.prototype.set = function(hash) {
  /** IMMUTABLE

  Given a hash like
      {
        artist: 'Nathaniel Merriweather',
        title: 'Strangers On A Train'
      }

  Add this.eqs like:
      [
        'artist = :arg1',
        'title = :arg2',
      ]

  While extending context with:
      {
        arg1: 'Nathaniel Merriweather',
        arg2: 'Strangers On A Train',
      }

  This function presumes that all object keys are safe, and all object values are unsafe.
  In this way, it's a lot like the .where() method

  If that's not true, you should add values to `this.query.eqs` directly.
  */
  var update = this.clone();
  for (var key in hash) {
    var arg_name = update._nextArg();
    update.context[arg_name] = hash[key];
    update.query.eqs.push(key + ' = :' + arg_name);
  }
  return update;
};

Update.prototype.setIf = function(hash) {
  /** IMMUTABLE

  Just like .set() except ignore undefined values.
  */
  var update = this.clone();
  for (var key in hash) {
    if (hash[key] !== undefined) {
      var arg_name = update._nextArg();
      update.context[arg_name] = hash[key];
      update.query.eqs.push(key + ' = :' + arg_name);
    }
  }
  return update;
};
