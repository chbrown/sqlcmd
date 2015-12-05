/**
Deep-copy a plain object or array. There is no special handling for other
types of objects; it simply copies everything else by reference.
*/
function clone<T>(obj: T): T {
  // typeof null == 'object' (wat), so we check for that case early.
  if (obj === null) {
    return obj;
  }
  else if (Array.isArray(obj)) {
    return (<any>obj).map(clone);
  }
  // typeof new Date() == 'object', so we check for that case too.
  else if (obj instanceof Date) {
    return <any>new Date(<any>obj);
  }
  else if (typeof obj === 'object') {
    var copy: T = <any>{};
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        copy[key] = clone(obj[key]);
      }
    }
    return copy;
  }
  else {
    // typeof undefined == 'undefined', so that will pass through here,
    // along with strings, numbers, true, and false.
    return obj;
  }
}

/**
Command represents an abstract SQL command.

statement
  Contains the fields that, together with the class, determine how to generate
  this command's actual SQL. This process is trigger by calling Command#toSQL().
parameters
  The parameters used in a parameterized query, matching the $name sequences in
  the generated SQL.
parameters_i
  Used to keep track of
*/
export default class Command {
  connection = undefined;
  statement: any = {};
  parameters: any = {};
  parameters_i = 1;
  // constructor() { }

  /**
  When a command is created via a connection's instance methods, e.g.,
  conn.Select(...), the connection will be attached to the command. This method
  calls #execute(...) on the originating connection, and will throw an Error if
  there is no available connection. This may be the case if the command was
  imported and instantiated directly, i.e., by calling
  Select = require('sqlcmd/commands/select').

  callback
    sent directly to this.connection.execute(command, callback)
  */
  execute(callback: (error: Error, results?: any[]) => void) {
    return this.connection.executeCommand(this, callback);
  }

  clone() {
    var copy = Object.create(this.constructor.prototype);
    copy.connection = this.connection;
    copy.statement = clone(this.statement);
    copy.parameters = clone(this.parameters);
    copy.parameters_i = this.parameters_i;
    return copy;
  }

  /**
  Replace a SQL string like 'name = ?' and args like ['chris']
  with a SQL string like 'name = $1' while updating Params#store
  so that Params#store['1'] = 'chris'

  Returns a string with all ?'s replaced with $1, $2, $3, etc., using the next
  available $N in Params, based on the current value of Params#index.

  If there are more ?'s than items in args, it will use the parameterized value,
  `undefined`, for the later ?'s. If there are more items in args than there are
  ?'s, those later items will be ignored.
  */
  interpolateQuestionMarks(sql: string, args: any[]) {
    if (typeof(sql) !== 'string') {
      var message = `Cannot interpolate question marks in object of type "${typeof(sql)}"; only strings are allowed.`;
      // error.object = sql;
      throw new Error(message);
    }
    return sql.replace(/\?/g, (match) => {
      var name = (this.parameters_i++).toString();
      this.parameters[name] = args.shift();
      return '$' + name;
    });
  }

  nextParameterName() {
    return (this.parameters_i++).toString();
  }
}

export function addCloneMethod(Class, method) {
  Class.prototype[method] = function() {
    return Class.prototype['_' + method].apply(this.clone(), arguments);
  };
}

export function addCloningMethods(Class, methods) {
  methods.forEach(function(method) {
    Class.prototype[method] = function(/* arguments */) {
      return Class.prototype['_' + method].apply(this.clone(), arguments);
    };
  });
}