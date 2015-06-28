var fs = require('fs');
var path = require('path');
var events = require('events');
var util = require('util-enhanced');

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

/** Connection#executePatches(patches_table: string,
                              patches_dirpath: string,
                              callback: (error: Error, filenames?: string[]))

Apply SQL patches to a database exactly once.

Similar to migration, but it only works one way.

1) Given a directory of SQL files
2) Find which ones have not been applied to the database
3) Apply the new SQL files to the database as needed, in alphabetical order
4) Record which files have been applied to the database in a special table

There is no up / down distinction, only applied / not-yet-applied.

There is no transaction support, so if it encounters an error, it may end up
in an inconsistent state.

patches_table
  The name of the table to (created if needed), which will record the
  application of patches onto the database.
patches_dirpath
  The directory containing .sql files to run as patches
callback
  Called whenever an error occurs, or all patches have
*/
Connection.prototype.executePatches = function(patches_table, patches_dirpath, callback) {
  var db = this;
  db.CreateTable(patches_table)
  .ifNotExists()
  .add([
    'filename TEXT NOT NULL',
    'applied TIMESTAMP DEFAULT current_timestamp NOT NULL',
  ])
  .execute(function(err) {
    if (err) return callback(err);
    fs.readdir(patches_dirpath, function(err, filenames) {
      if (err) return callback(err);

      db.Select(patches_table)
      .execute(function(err, patches) {
        // patches: {filename: string, applied: Date}[]
        if (err) return callback(err);
        // applied_filenames: string[]
        var applied_filenames = patches.map(function(patch) {
          return patch.filename;
        });

        var unapplied_filenames = filenames.filter(function(filename) {
          return applied_filenames.indexOf(filename) === -1 && filename.match(/\.sql$/);
        }).sort();

        var newly_applied_filenames = [];

        (function loop() {
          var unapplied_filename = unapplied_filenames.shift();
          if (unapplied_filename === undefined) {
            // no more filenames; we're finished!
            return callback(null, newly_applied_filenames);
          }
          else {
            var unapplied_filepath = path.join(patches_dirpath, unapplied_filename);
            fs.readFile(unapplied_filepath, {encoding: 'utf8'}, function(err, file_contents) {
              if (err) return callback(err);

              db.executeSQL(file_contents, [], function(err) {
                if (err) return callback(err);

                db.Insert(patches_table)
                .set({filename: unapplied_filename})
                .execute(function(err) {
                  if (err) return callback(err);

                  newly_applied_filenames.push(unapplied_filename);
                  loop();
                });
              });
            });
          }
        })();
      });
    });
  });
};

module.exports = Connection;
