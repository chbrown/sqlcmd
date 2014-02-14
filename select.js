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
  var query = this.query;
  var parts = ['SELECT'];
  // add columns
  if (query.columns.length === 0) {
    parts.push('*');
  }
  else {
    lib.pushAll(parts, query.columns);
  }
  // from table
  parts.push('FROM ' + query.table);
  // where ...
  if (query.wheres.length > 0) {
    parts.push('WHERE ' + query.wheres.join(' AND '));
  }
  // order by ...
  if (query.order_bys.length > 0) {
    parts.push('ORDER BY ' + query.order_bys.join(', '));
  }
  // limit
  if (query.limit) {
    parts.push('LIMIT ' + query.limit);
  }
  // offset
  if (query.offset) {
    parts.push('OFFSET ' + query.offset);
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
Select.prototype.where = function(sql /*, args... */) {
  /** IMMUTABLE */
  var select = this.clone();
  var args = lib.slice(arguments, 1);
  if (args.length > 0) {
    sql = select._interpolate(sql, args);
  }
  select.query.wheres.push(sql);
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
Select.prototype.addColumns = function(/* columns... */) {
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
