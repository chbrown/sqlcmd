/*jslint node: true */
var util = require('util-enhanced');
var Command = require('../command');

function CreateTable(table) {
  Command.call(this);
  this.statement.table = table;
  this.statement.if_not_exists = false;
  this.statement.columns = [];
}
util.inherits(CreateTable, Command);

CreateTable.prototype.toSQL = function() {
  var parts = ['CREATE TABLE'];

  if (this.statement.if_not_exists) {
    parts.push('IF NOT EXISTS');
  }

  parts.push(this.statement.table, '(', this.statement.columns.join(', '), ')');
  return parts.join(' ');
};

CreateTable.prototype._add = function(columns) {
  util.pushAll(this.statement.columns, columns);
  return this;
};

CreateTable.prototype._ifNotExists = function() {
  this.statement.if_not_exists = true;
  return this;
};

Command.addCloningMethods.call(CreateTable, [
  'add',
  'ifNotExists',
]);

module.exports = CreateTable;
