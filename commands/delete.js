/*jslint node: true */
var util = require('util');

var lib = require('../lib');
var Command = require('./').Command;

var Delete = exports.Delete = function(from) {
  Command.call(this);
  this.from = from;
  this.wheres = [];
};
util.inherits(Delete, Command);

Delete.prototype.clone = function() {
  var del = new Delete(this.from);
  del.wheres = lib.clone(this.wheres);
  del.context = lib.clone(this.context);
  del.connection = this.connection;
  return del;
};
Delete.prototype._sql = function() {
  var parts = ['DELETE FROM', this.from];
  if (this.wheres.length > 0) {
    parts.push('WHERE ' + this.wheres.join(' AND '));
  }
  return parts.join(' ');
};

/** --- MUTABLE --- */
Delete.prototype._where = function(sql /*, args... */) {
  var args = lib.slice(arguments, 1);
  if (args.length > 0) {
    sql = this._interpolate(sql, args);
  }
  this.wheres.push(sql);
  return this;
};
Delete.prototype._whereEqual = function(hash) {
  /** Just like Select._whereEqual (be careful with the keys) */
  for (var key in hash) {
    if (hash[key] !== undefined) {
      this._where(key + ' = ?', hash[key]);
    }
  }
  return this;
};

Command.immutable.call(Delete, ['where', 'whereEqual']);
