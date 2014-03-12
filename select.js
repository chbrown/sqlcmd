/*jslint node: true */
var util = require('util');
var lib = require('./lib');
var command = require('./command');

var Select = exports.Select = function(query, context) {
  command.Command.call(this, query, context);
  lib.extend(this.query, {
    columns: [],
    wheres: [],
    order_bys: [],
    limit: null,
    offset: null,
  }, query);
};
util.inherits(Select, command.Command);
Select.prototype.join = function() {
  // var parts = ['SELECT', this.q.select, 'FROM', this.q.table];
  // if (this.q.wheres.length > 0)
  //   parts.extend(['WHERE', this.q.wheres.join(' AND ')]);
  // if (this.q.order !== null)
  //   parts.extend(['ORDER BY', this.q.order]);
  // if (this.q.offset !== null)
  //   parts.extend(['OFFSET', this.q.offset]);
  // if (this.q.limit !== null)
  //   parts.extend(['LIMIT', this.q.limit]);
  // return parts.join(' ');
  var parts = ['SELECT'];
  // add columns
  if (this.query.columns.length === 0) {
    parts.push('*');
  }
  else {
    parts.push(this.query.columns.join(', '));
  }
  // from table
  parts.push('FROM ' + this.query.table);
  // where ...
  if (this.query.wheres.length > 0) {
    parts.push('WHERE ' + this.query.wheres.join(' AND '));
  }
  // order by ...
  if (this.query.order_bys.length > 0) {
    parts.push('ORDER BY ' + this.query.order_bys.join(', '));
  }
  // limit
  if (this.query.limit) {
    parts.push('LIMIT ' + this.query.limit);
  }
  // offset
  if (this.query.offset) {
    parts.push('OFFSET ' + this.query.offset);
  }
  return parts.join(' ');
};
Select.prototype.clone = function() {
  // returns semi-shallow clone; should be deep *enough*
  var new_query = {
    table: this.query.table,
    columns: lib.clone(this.query.columns),
    wheres: lib.clone(this.query.wheres),
    order_bys: lib.clone(this.query.order_bys),
    limit: this.query.limit,
    offset: this.query.offset,
  };
  var new_context = lib.clone(this.context);
  return new Select(new_query, new_context);
};
Select.prototype._where = function(sql, arg) {
  /** MUTABLE */
  var interpolated_sql = this._interpolate(sql, [arg]);
  this.query.wheres.push(interpolated_sql);
  return this;
};
Select.prototype.where = function(sql, arg) {
  /** IMMUTABLE

  arg needn't be anything, UNLESS sql contains a ?, in which case it better be something.

  where() is not overloaded, call it with a string (and maybe a parameterized value)

  If you want to call it with an object, use whereEqual.
  */
  return this._where.apply(this.clone(), arguments);
};
Select.prototype.whereEqual = function(obj) {
  /** IMMUTABLE
  This functions just like calling where() several times with simple
  ('column = ?', value) pairs. Be careful with this one! only the
  hash's values (strings, I hope) will be escaped, so SQL injection is
  totally possible with the keys.
  */
  var select = this.clone();
  // return this._where.apply(this.clone(), arguments);
  for (var key in obj) {
    select = select._where(key + ' = ?', obj[key]);
  }
  return select;
};
Select.prototype.whereIf = function(sql /*, args... */) {
  /** Just like where, except ignored if the args are undefined.
  Too much of a hack / special case? */
  var select = this;
  var args = lib.slice(arguments, 1);
  if (args.length > 0) {
    var all_defined = args.every(function(x) {
      return x !== undefined;
    });
    if (all_defined) {
      select = select.clone();
      sql = select._interpolate(sql, args);
      select.query.wheres.push(sql);
    }
  }
  return select;
};
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
  this.query.wheres.push(column + ' IN (' + inlist + ')');
  return this;
};
Select.prototype.whereIn = function(column, list) {
  return this._whereIn.apply(this.clone(), arguments);
};


Select.prototype.add = function(/* columns... */) {
  /** IMMUTABLE */
  var select = this.clone();
  var columns = lib.slice(arguments, 0);
  lib.pushAll(select.query.columns, columns);
  return select;
};
Select.prototype.updateContext = function(key, value) {
  /** IMMUTABLE */
  var select = this.clone();
  select.context[key] = value;
  return select;
};
Select.prototype.offset = function(offset) {
  /** IMMUTABLE */
  var select = this.clone();
  select.query.offset = offset;
  return select;
};
Select.prototype.limit = function(limit) {
  /** IMMUTABLE */
  var select = this.clone();
  select.query.limit = limit;
  return select;
};
Select.prototype.orderBy = function(/* columns... */) {
  /** IMMUTABLE */
  var select = this.clone();
  var columns = lib.slice(arguments, 0);
  lib.pushAll(select.query.order_bys, columns);
  return select;
};
