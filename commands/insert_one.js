var util = require('util');
var Insert = require('./insert');

/**
The user is still responsible for adding the .returning('*') clause.
*/
function InsertOne(table) {
  Insert.call(this, table);
}
util.inherits(InsertOne, Insert);

InsertOne.prototype.execute = function(callback) {
  return this.connection.executeCommand(this, function(err, rows) {
    if (err) return callback(err);
    if (rows.length === 0) return callback(null);

    callback(null, rows[0]);
  });
};

module.exports = InsertOne;
