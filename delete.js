/*jslint node: true */
var util = require('util');
var command = require('./command');
var lib = require('./lib');

var Delete = exports.Delete = function(query, context) {
  command.Command.call(this, query, context);
  lib.extend(this.query, {
    wheres: [],
  }, query);
};
util.inherits(Delete, command.Command);

Delete.prototype.clone = function() {
  var new_query = {
    table: this.query.table,
    wheres: lib.clone(this.query.wheres),
  };
  var new_context = lib.clone(this.context);
  return new Delete(new_query, new_context);
};
Delete.prototype.join = function() {
  var parts = ['DELETE FROM', this.query.table];
  if (this.query.wheres.length > 0) {
    parts.push('WHERE ' + this.query.wheres.join(' AND '));
  }
  return parts.join(' ');
};
Delete.prototype.where = function(sql /*, args... */) {
  /** IMMUTABLE */
  var del = this.clone();
  var args = lib.slice(arguments, 1);
  if (args.length > 0) {
    sql = del._interpolate(sql, args);
  }
  del.query.wheres.push(sql);
  return del;
};
