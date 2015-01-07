/*jslint node: true */
var util = require('util-enhanced');
var Command = require('../command');

function Delete(table) {
  Command.call(this);
  this.statement.table = table;
  this.statement.wheres = [];
}
util.inherits(Delete, Command);

Delete.prototype.toSQL = function() {
  var parts = ['DELETE FROM', this.statement.table];
  if (this.statement.wheres.length > 0) {
    parts.push('WHERE', this.statement.wheres.join(' AND '));
  }
  return parts.join(' ');
};

Delete.prototype._where = function(sql /*, args... */) {
  var args = [];
  for (var i = 1, l = arguments.length; i < l; i++) {
    args.push(arguments[i]);
  }

  sql = this.interpolateQuestionMarks(sql, args);
  this.statement.wheres.push(sql);
  return this;
};

/** Delete#_whereEqual(hash: object)

Just like Select._whereEqual: be careful with the keys.
*/
Delete.prototype._whereEqual = function(hash) {
  for (var column in hash) {
    var value = hash[column];
    if (value !== undefined) {
      this.statement.wheres.push(column + ' = $' + column);
      this.parameters[column] = value;
    }
  }
  return this;
};

Command.addCloningMethods.call(Delete, [
  'where',
  'whereEqual',
]);

module.exports = Delete;
