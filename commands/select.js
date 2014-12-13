/*jslint node: true */
var util = require('util');

var lib = require('../lib');
var Command = require('./').Command;

var Select = exports.Select = function(from) {
  Command.call(this);
  this.from = from;
  this.columns = [];
  this.wheres = [];
  this.group_bys = [];
  this.order_bys = [];
  // this.query_limit = null;
  // this.query_offset = null;
};
util.inherits(Select, Command);

Select.prototype._sql = function() {
  var parts = ['SELECT'];
  // add columns
  if (this.columns.length === 0) {
    parts.push('*');
  }
  else {
    parts.push(this.columns.join(', '));
  }
  // from table
  parts.push('FROM ' + this.from);
  // where ...
  if (this.wheres.length > 0) {
    parts.push('WHERE ' + this.wheres.join(' AND '));
  }
  // group by ...
  if (this.group_bys.length > 0) {
    parts.push('GROUP BY ' + this.group_bys.join(', '));
  }
  // order by ...
  if (this.order_bys.length > 0) {
    parts.push('ORDER BY ' + this.order_bys.join(', '));
  }
  // limit
  if (this.query_limit) {
    var limit_arg = this._nextArg();
    this.context[limit_arg] = this.query_limit;
    parts.push('LIMIT :' + limit_arg);
  }
  // offset
  if (this.query_offset) {
    var offset_arg = this._nextArg();
    this.context[offset_arg] = this.query_offset;
    parts.push('OFFSET :' + offset_arg);
  }
  return parts.join(' ');
};
Select.prototype.clone = function() {
  // returns semi-shallow clone; should be deep *enough*
  var select = new Select(this.from);
  select.columns = lib.clone(this.columns);
  select.wheres = lib.clone(this.wheres);
  select.group_bys = lib.clone(this.group_bys);
  select.order_bys = lib.clone(this.order_bys);
  select.query_limit = this.query_limit;
  select.query_offset = this.query_offset;
  select.context = lib.clone(this.context);
  select.connection = this.connection;
  return select;
};


/** --- MUTABLE --- */
Select.prototype._add = function(/* columns... */) {
  var columns = lib.slice(arguments, 0);
  lib.pushAll(this.columns, columns);
  return this;
};
Select.prototype._where = function(sql /*, args... */) {
  /**
  args needn't be anything, UNLESS sql contains a ?, in which case it better be something.

  where() is not overloaded; call it with a string (and maybe parameterized values)
  If you want to call it with an object, use whereEqual().
  */
  var args = lib.slice(arguments, 1);
  var interpolated_sql = this._interpolate(sql, args);
  this.wheres.push(interpolated_sql);
  return this;
};
Select.prototype._whereEqual = function(hash) {
  /**
  This functions just like calling where() several times with simple
  ('column = ?', value) pairs. Be careful with this one! only the hash's
  values will be escaped, so SQL injection is totally possible with the keys.
  */
  for (var key in hash) {
    if (hash[key] !== undefined) {
      this._where(key + ' = ?', hash[key]);
    }
  }
  return this;
};
Select.prototype._whereIn = function(column, list) {
  /** Though ugly, apparently this is just how it works:

  https://github.com/brianc/node-postgres/issues/431

  Ends up with something like 'x IN(:arg1, :arg2, :arg3)' and then
    {arg1: 'a', arg2: 'b', arg3: 'c'} in the context
  Thus, each item in list is escaped (but column is not)
  */
  var self = this;
  if (list.length) {
    var inlist = list.map(function(item) {
      var arg_name = self._nextArg();
      self.context[arg_name] = item;
      return ':' + arg_name;
    }).join(', ');
    this.wheres.push(column + ' IN (' + inlist + ')');
  }
  else {
    // 0-length lists get special treatment.
    // something is never an element of the empty list, but 'WHERE x IN ()'
    // is a syntax error, not FALSE, in PostgreSQL
    this.wheres.push('FALSE');
  }
  return this;
};
Select.prototype._groupBy = function(/* columns... */) {
  var columns = lib.slice(arguments, 0);
  lib.pushAll(this.group_bys, columns);
  return this;
};
Select.prototype._orderBy = function(/* columns... */) {
  var columns = lib.slice(arguments, 0);
  lib.pushAll(this.order_bys, columns);
  return this;
};
Select.prototype._offset = function(offset) {
  this.query_offset = offset;
  return this;
};
Select.prototype._limit = function(limit) {
  this.query_limit = limit;
  return this;
};

Select.prototype._updateContext = function(key, value) {
  this.context[key] = value;
  return this;
};

// extend with IMMUTABLE variants
Command.immutable.call(Select,
  ['add', 'where', 'whereEqual', 'whereIn', 'groupBy', 'orderBy', 'offset', 'limit', 'updateContext']);
