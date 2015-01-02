/*jslint node: true */
var util = require('util-enhanced');
var Command = require('../command');

function Select(table) {
  Command.call(this);
  this.statement.table = table;
  this.statement.columns = [];
  this.statement.wheres = [];
  this.statement.group_bys = [];
  this.statement.order_bys = [];
  // this.query_limit = null;
  // this.query_offset = null;
}
util.inherits(Select, Command);

Select.prototype.toSQL = function() {
  var parts = ['SELECT'];
  // add columns
  if (this.statement.columns.length === 0) {
    parts.push('*');
  }
  else {
    parts.push(this.statement.columns.join(', '));
  }
  // from table
  parts.push('FROM', this.statement.table);
  // where ...
  if (this.statement.wheres.length > 0) {
    parts.push('WHERE', this.statement.wheres.join(' AND '));
  }
  // group by ...
  if (this.statement.group_bys.length > 0) {
    parts.push('GROUP BY ' + this.statement.group_bys.join(', '));
  }
  // order by ...
  if (this.statement.order_bys.length > 0) {
    parts.push('ORDER BY ' + this.statement.order_bys.join(', '));
  }
  // limit
  if (this.statement.limit) {
    parts.push('LIMIT', this.statement.limit);
  }
  // offset
  if (this.statement.offset) {
    parts.push('OFFSET', this.statement.offset);
  }
  return parts.join(' ');
};

Select.prototype._add = function(/* columns... */) {
  for (var i = 0; i < arguments.length; i++) {
    this.statement.columns.push(arguments[i]);
  }
  return this;
};
Select.prototype._where = function(sql /*, args... */) {
  /**
  where() is not overloaded; call it with a string (and maybe parameterized values)
  If you want to call it with an object, use whereEqual().
  */
  var args = [];
  for (var i = 1; i < arguments.length; i++) {
    args[i] = arguments[i];
  }

  sql = this.interpolateQuestionMarks(sql, args);
  this.statement.wheres.push(sql);

  return this;
};
Select.prototype._whereEqual = function(hash) {
  /**
  This functions just like calling where() several times with simple
  ('column = ?', value) pairs. Be careful with this one! only the hash's
  values will be escaped, so SQL injection is totally possible with the keys.
  */
  for (var column in hash) {
    var value = hash[column];
    if (value !== undefined) {
      this.statement.wheres.push(column + ' = $' + column);
      this.parameters[column] = value;
    }
  }
  return this;
};
Select.prototype._whereIn = function(column, list) {
  /** Though ugly, apparently this is just how it works:

  https://github.com/brianc/node-postgres/issues/431

  Ends up with something like 'x IN($arg1, $arg2, $arg3)' and then
    {arg1: 'a', arg2: 'b', arg3: 'c'} in the properties
  Thus, each item in list is escaped (but column is not)
  */
  var self = this;
  if (list.length > 0) {
    var inlist = list.map(function(item) {
      var name = self.nextParameterName();
      self.parameters[name] = item;
      return '$' + name;
    }).join(', ');
    this.statement.wheres.push(column + ' IN (' + inlist + ')');
  }
  else {
    // 0-length lists get special treatment.
    // something is never an element of the empty list, but 'WHERE x IN ()'
    // is a syntax error, not FALSE, in PostgreSQL
    this.statement.wheres.push('FALSE');
  }
  return this;
};
Select.prototype._groupBy = function(/* columns... */) {
  /** Vulnerable to SQL injection! */
  for (var i = 0; i < arguments.length; i++) {
    this.statement.group_bys.push(arguments[i]);
  }
  return this;
};
Select.prototype._orderBy = function(/* columns... */) {
  /** Vulnerable to SQL injection! */
  for (var i = 0; i < arguments.length; i++) {
    this.statement.order_bys.push(arguments[i]);
  }
  return this;
};
Select.prototype._offset = function(offset) {
  this.statement.offset = '$offset';
  this.parameters.offset = offset;
  return this;
};
Select.prototype._limit = function(limit) {
  this.statement.limit = '$limit';
  this.parameters.limit = limit;
  return this;
};

Command.addCloningMethods.call(Select,
  ['add', 'where', 'whereEqual', 'whereIn', 'groupBy', 'orderBy', 'offset', 'limit']);

module.exports = Select;
