/*jslint node: true */
var util = require('util');

var lib = require('../lib');
var Command = require('./').Command;

var Select = exports.Select = function(from) {
  Command.call(this);
  this.from = from;
  this.columns = [];
  this.wheres = [];
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
Select.prototype._where = function(sql, arg) {
  /**
  arg needn't be anything, UNLESS sql contains a ?, in which case it better be something.

  where() is not overloaded, call it with a string (and maybe a parameterized value)

  If you want to call it with an object, use whereEqual.
  */
  var interpolated_sql = this._interpolate(sql, [arg]);
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
// Select.prototype.whereIf = function(sql /*, args... */) {
//   /** Just like where, except ignored if the args are undefined.
//   Too much of a hack / special case? */
//   var select = this;
//   var args = lib.slice(arguments, 1);
//   if (args.length > 0) {
//     var all_defined = args.every(function(x) {
//       return x !== undefined;
//     });
//     if (all_defined) {
//       select = select.clone();
//       sql = select._interpolate(sql, args);
//       select.wheres.push(sql);
//     }
//   }
//   return select;
// };
Select.prototype._whereIn = function(column, list) {
  /** Though ugly, apparently this is just how it works:

  https://github.com/brianc/node-postgres/issues/431

  Ends up with something like 'x IN(:arg1, :arg2, :arg3)' and then
    {arg1: 'a', arg2: 'b', arg3: 'c'} in the context
  Thus, each item in list is escaped (but column is not)
  */
  var self = this;
  var inlist = list.map(function(item) {
    var arg_name = self._nextArg();
    self.context[arg_name] = item;
    return ':' + arg_name;
  }).join(', ');
  this.wheres.push(column + ' IN (' + inlist + ')');
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
  ['add', 'where', 'whereEqual', 'whereIn', 'orderBy', 'offset', 'limit', 'updateContext']);
