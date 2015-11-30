var events = require('events');
var util = require('util');

/** new Connection(options: any)

Connection provides a single interface to functionality of sqlcmd, and stores
configuration defaults to be used with every query. The options are unused in
sqlcmd; only sqlcmd-pg, sqlcmd-sqlite3, etc., use the options argument.

Events:
  .on('log', function(log_level, message, ...args) { ... })

*/
function Connection(options) {
  events.EventEmitter.call(this);
  this.options = options;
}
util.inherits(Connection, events.EventEmitter);

/** Connection.addCommand(name: string, CommandConstructor: typeof Command)

Assuming that CommandConstructor is a typical constructor, binds it to
a non-constructor function at Connection#<name>, creates a new instance of the
command, and sets command.connection to `this`. CommandConstructor's type should
be a subclass of sqlcmd.Command.
*/
Connection.addCommand = function(name, CommandConstructor) {
  this.prototype[name] = function(/* args... */) {
    // var command = new CommandConstructor(opts);
    var command = Object.create(CommandConstructor.prototype);
    // using Function.apply is one of the only optimizable ways to use `arguments` in a function call
    // if the constructor returns a value, just ignore it.
    CommandConstructor.apply(command, arguments);
    // set the command's connection property, which is the main point of this function
    command.connection = this;
    return command;
  };
};

Connection.addCommand('Select', require('./commands/select'));
Connection.addCommand('SelectOne', require('./commands/select_one'));
Connection.addCommand('Insert', require('./commands/insert'));
Connection.addCommand('InsertOne', require('./commands/insert_one'));
Connection.addCommand('Update', require('./commands/update'));
Connection.addCommand('Delete', require('./commands/delete'));
Connection.addCommand('CreateTable', require('./commands/create_table'));

/** Connection#executeCommand(command: Command,
                              callback: (error: Error, rows: object[]))

Execute a sqlcmd Command instance against this connection. Usually called by
Command#execute() after the Command instance has been initialized with a
sqlcmd.Connection.
*/
Connection.prototype.executeCommand = function(command, callback) {
  throw new Error('not implemented');
};

/** Connection#executeSQL(sql: string,
                          args: any[] | {[index: string]: any},
                          callback: (error: Error, rows: object[]))

Execute a plain SQL query, potentially with prepared parameters, against this
sqlcmd.Connection.
*/
Connection.prototype.executeSQL = function(sql, args, callback) {
  throw new Error('not implemented');
};

module.exports = Connection;
