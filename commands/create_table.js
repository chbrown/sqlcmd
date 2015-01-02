/*jslint node: true */
var util = require('util-enhanced');
var Command = require('../command');

function CreateTable(table) {
  Command.call(this);
  this.statement.table = table;
  this.statement.columns = [];
}
util.inherits(CreateTable, Command);

CreateTable.prototype.toSQL = function() {
  return ['CREATE TABLE', this.statement.table,
    '(', this.statement.columns.join(', '), ')'].join(' ');
};

CreateTable.prototype._add = function(columns) {
  util.pushAll(this.statement.columns, columns);
  return this;
};

Command.addCloningMethods.call(CreateTable, ['add']);

module.exports = CreateTable;
