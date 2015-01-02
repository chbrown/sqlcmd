/*jslint node: true */
var util = require('util-enhanced');
var Command = require('../command');

function Insert(table) {
  Command.call(this);
  this.statement.table = table;
  this.statement.columns = [];
  // should be as long as columns; often $variables, but not necessarily
  this.statement.values = [];
}
util.inherits(Insert, Command);

/** Insert#toSQL()

Generates a string like:
  INSERT INTO responses (user_id, experiment_id, stimulus_id, value)
    VALUES ($1, $2, $3, $4)
*/
Insert.prototype.toSQL = function() {
  var parts = ['INSERT INTO', this.statement.table];
  // no columns means ALL columns, in default order
  if (this.statement.columns.length > 0) {
    parts.push('(' + this.statement.columns.join(', ') + ')');
  }
  // no values means defaults only
  if (this.statement.values.length === 0) {
    parts.push('DEFAULT VALUES');
  }
  else {
    parts.push('VALUES (' + this.statement.values.join(', ') + ')');
  }

  // might as well, no?
  parts.push('RETURNING *');

  return parts.join(' ');
};

Insert.prototype._add = function(column, value) {
  this.statement.columns.push(column);
  this.parameters[column] = value;
  this.statement.values.push('$' + column);
  return this;
};
Insert.prototype._set = function(hash) {
  /**
  Like Update#set, this function presumes that all object keys are safe, and all object values are unsafe.

  Ignore undefined values.
  */
  for (var column in hash) {
    var value = hash[column];
    if (value !== undefined) {
      this._add(column, value);
    }
  }
  return this;
};

Command.addCloningMethods.call(Insert, ['add', 'set']);

module.exports = Insert;
