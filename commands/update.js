/*jslint node: true */
var util = require('util');

var lib = require('../lib');
var Command = require('./').Command;

var Update = exports.Update = function(table) {
  Command.call(this);
  this.table = table;
  this.eqs = []; // equations / equalities (column-expression pairs)
  this.wheres = [];
};
util.inherits(Update, Command);

Update.prototype.clone = function() {
  // returns semi-shallow clone; should be deep *enough*
  var update = new Update(this.table);
  update.eqs = lib.clone(this.eqs);
  update.wheres = lib.clone(this.wheres);
  update.context = lib.clone(this.context);
  update.connection = this.connection;
  return update;
};
Update.prototype._sql = function() {
  var parts = ['UPDATE', this.table];
  // e.g., 'UPDATE users SET ip = $1, user_agent = $2 WHERE id = $3';
  if (this.eqs.length > 0) {
    parts.push('SET', this.eqs.join(', '));
  }
  if (this.wheres.length > 0) {
    parts.push('WHERE ' + this.wheres.join(' AND '));
  }

  parts.push('RETURNING *');

  return parts.join(' ');
};
Update.prototype._where = function(sql /*, args... */) {
  var args = lib.slice(arguments, 1);
  if (args.length > 0) {
    sql = this._interpolate(sql, args);
  }
  this.wheres.push(sql);
  return this;
};
Update.prototype._whereEqual = function(hash) {
  /** Just like Select._whereEqual */
  for (var key in hash) {
    if (hash[key] !== undefined) {
      this._where(key + ' = ?', hash[key]);
    }
  }
  return this;
};


Update.prototype._set = function(hash) {
  /**
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

  If that's not true, you should add values to `this.eqs` directly.
  */
  for (var key in hash) {
    if (hash[key] !== undefined) {
      var arg_name = this._nextArg();
      this.context[arg_name] = hash[key];
      this.eqs.push(key + ' = :' + arg_name);
    }
  }
  return this;
};

Command.immutable.call(Update, ['set', 'where', 'whereEqual']);
