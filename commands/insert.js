/*jslint node: true */
var util = require('util');

var lib = require('../lib');
var Command = require('./').Command;

var Insert = exports.Insert = function(into) {
  Command.call(this);
  this.into = into;
  this.columns = [];
  this.values = []; // should be as long as columns; often :variables, but not necessarily
};
util.inherits(Insert, Command);

Insert.prototype.clone = function() {
  var insert = new Insert(this.into);
  insert.columns = lib.clone(this.columns);
  insert.values = lib.clone(this.values);
  insert.context = lib.clone(this.context);
  insert.connection = this.connection;
  return insert;
};
Insert.prototype._sql = function() {
  /**
  e.g.,
    INSERT INTO responses (user_id, experiment_id, stimulus_id, value, details, modified)
      VALUES ($1, $2, $3, $4, $5, NOW())
  */
  var parts = ['INSERT INTO', this.into];
  // no columns means ALL columns, in default order
  if (this.columns.length > 0) {
    parts.push('(', this.columns.join(', ') + ')');
  }
  // no values means defaults only
  if (this.values.length === 0) {
    parts.push('DEFAULT VALUES');
  }
  else {
    parts.push('VALUES (' + this.values.join(', ') + ')');
  }

  // might as well, no?
  parts.push('RETURNING *');

  return parts.join(' ');
};

/** --- MUTABLE --- */
Insert.prototype._add = function(column, value) {
  var arg_name = this._nextArg();
  this.context[arg_name] = value;
  this.columns.push(column);
  this.values.push(':' + arg_name);
  return this;
};
Insert.prototype._set = function(hash) {
  /**
  Like Update#set, this function presumes that all object keys are safe, and all object values are unsafe.

  Ignore undefined values.
  */
  for (var key in hash) {
    if (hash[key] !== undefined) {
      this._add(key, hash[key]);
    }
  }
  return this;
};

// create IMMUTABLE variants
Command.immutable.call(Insert, ['add', 'set']);
