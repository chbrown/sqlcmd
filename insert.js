/*jslint node: true */
var util = require('util');
var command = require('./command');
var lib = require('./lib');

var Insert = exports.Insert = function(query, context) {
  command.Command.call(this, query, context);
  lib.extend(this.query, {
    columns: [],
    values: [], // should be as long as columns; often :variables, but not necessarily
  }, query);
};
util.inherits(Insert, command.Command);

Insert.prototype.clone = function() {
  var new_query = {
    table: this.query.table,
    columns: lib.clone(this.query.columns),
    values: lib.clone(this.query.values),
  };
  var new_context = lib.clone(this.context);
  return new Insert(new_query, new_context);
};
Insert.prototype.join = function() {
  /**
  e.g.,
    INSERT INTO responses (user_id, experiment_id, stimulus_id, value, details, modified)
      VALUES ($1, $2, $3, $4, $5, NOW())
  */
  var parts = ['INSERT INTO', this.query.table];
  // no columns means ALL columns, in default order
  if (this.query.columns.length > 0) {
    parts.push('(', this.query.columns.join(', ') + ')');
  }
  // no values means defaults only
  if (this.query.values.length === 0) {
    parts.push('DEFAULT VALUES');
  }
  else {
    parts.push('VALUES (' + this.query.values.join(', ') + ')');
  }

  // might as well, no?
  parts.push('RETURNING *');

  return parts.join(' ');
};

/** the destructive methods follow this convention:
   _method() (may) alter the object
   method() will return a new object with the change if a change applies
*/
Insert.prototype._add = function(column, value) {
  /** MUTABLE */
  var arg_name = this._nextArg();
  this.context[arg_name] = value;
  this.query.columns.push(column);
  this.query.values.push(':' + arg_name);
  return this;
};
Insert.prototype.add = function(column, value) {
  /** IMMUTABLE */
  return this.clone()._add(column, value);
};
Insert.prototype._addIf = function(column, value) {
  /** MUTABLE */
  if (value !== undefined && value !== null) {
    return this._add(column, value);
  }
  return this;
};
Insert.prototype.addIf = function(column, value) {
  /** IMMUTABLE */
  return this.clone()._addIf(column, value);
};
Insert.prototype._set = function(hash) {
  /** MUTABLE */
  for (var key in hash) {
    this._add(key, hash[key]);
  }
  return this;
};
Insert.prototype.set = function(hash) {
  /** IMMUTABLE

  Like Update#set, this function presumes that all object keys are safe, and all object values are unsafe.
  */
  return this.clone()._set(hash);
};
Insert.prototype._setIf = function(hash) {
  /** MUTABLE */
  for (var key in hash) {
    this._addIf(key, hash[key]);
  }
  return this;
};
Insert.prototype.setIf = function(hash) {
  /** IMMUTABLE

  Just like .set() except ignore null/undefined values.
  */
  return this.clone()._setIf(hash);
};
