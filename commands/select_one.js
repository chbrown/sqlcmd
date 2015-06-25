var util = require('util-enhanced');
var Select = require('./select');

function SelectOne(table) {
  Select.call(this, table);
  this.statement.limit = '1';
}
util.inherits(SelectOne, Select);

SelectOne.prototype.execute = function(callback) {
  return this.connection.executeCommand(this, function(err, rows) {
    if (err) return callback(err, null);
    if (rows.length === 0) return callback(null, null);

    callback(null, rows[0]);
  });
};

module.exports = SelectOne;
