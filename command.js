/*jslint node: true */
var util = require('util-enhanced');

/** new Command()
Command represents an abstract SQL command.

statement: any
  Contains the fields that, together with the class, determine how to generate
  this command's actual SQL. This process is trigger by calling Command#toSQL().
parameters: any
  The parameters used in a parameterized query, matching the $name sequences in
  the generated SQL.
parameters_i: number
  Used to keep track of
*/
var Command = module.exports = function() {
  this.connection = undefined;
  this.statement = {};
  this.parameters = {};
  this.parameters_i = 1;
};
/** Command#execute(callback: (err: Error, results: any[]))

When a command is created via a connection's instance methods, e.g.,
conn.Select(...), the connection will be attached to the command. This method
calls #execute(...) on the originating connection, and will throw an Error if
there is no available connection. This may be the case if the command was
imported and instantiated directly, i.e., by calling
Select = require('sqlcmd/commands/select').

callback
  sent directly to this.connection.execute(command, callback)
*/
Command.prototype.execute = function(callback) {
  return this.connection.executeCommand(this, callback);
};
Command.prototype.clone = function() {
  var copy = Object.create(this.constructor.prototype);
  copy.connection = this.connection;
  copy.statement = util.clone(this.statement);
  copy.parameters = util.clone(this.parameters);
  copy.parameters_i = this.parameters_i;
  return copy;
};

Command.addCloneMethod = function(method) {
  var Class = this;
  Class.prototype[method] = function() {
    return Class.prototype['_' + method].apply(this.clone(), arguments);
  };
};
Command.addCloningMethods = function(methods) {
  var Class = this;
  methods.forEach(function(method) {
    Class.prototype[method] = function(/* arguments */) {
      return Class.prototype['_' + method].apply(this.clone(), arguments);
    };
  });
};

/** Command#interpolateQuestionMarks(sql: string, args: object[])

Replace a SQL string like 'name = ?' and args like ['chris']
with a SQL string like 'name = $1' while updating Params#store
so that Params#store['1'] = 'chris'

Returns a string with all ?'s replaced with $1, $2, $3, etc., using the next
available $N in Params, based on the current value of Params#index.

If there are more ?'s than items in args, it will use the parameterized value,
`undefined`, for the later ?'s. If there are more items in args than there are
?'s, those later items will be ignored.
*/
Command.prototype.interpolateQuestionMarks = function(sql, args) {
  if (typeof(sql) !== 'string') {
    var message = 'Cannot interpolate question marks in object of type "' + typeof(sql) + '"; only strings are allowed.';
    var error = new Error(message);
    error.object = sql;
    throw error;
  }
  var self = this;
  return sql.replace(/\?/g, function(match) {
    var name = (self.parameters_i++).toString();
    self.parameters[name] = args.shift();
    return '$' + name;
  });
};

Command.prototype.nextParameterName = function() {
  return (this.parameters_i++).toString();
};
