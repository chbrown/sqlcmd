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

@param {statement} Contains the fields that, together with the class, determine
       how to generate this command's actual SQL, e.g., when calling Command#toSQL().
@param {parameters} The parameters used in a parameterized query, matching the
       $name sequences in the generated SQL.
@param {parameters_i} Used to keep track of positional parameters.
*/
abstract class Command<R> {
  connection = undefined;
  statement: any = {};
  parameters: any = {};
  parameters_i = 1;
  protected _oneResult: boolean = false;

  /**
  When a command is created via a connection's instance methods, e.g.,
  conn.Select(...), the connection will be attached to the command. This method
  calls #executeCommand(...) on the originating connection, and will throw an Error if
  there is no available connection. This may be the case if the command was
  imported and instantiated directly, i.e., by calling
  Select = require('sqlcmd/commands/select').

  callback
    sent directly to this.connection.execute(command, callback)
  */
  execute(callback: (error: Error, result?: R) => void) {
    return this.connection.executeCommand(this, (error, results) => {
      if (error) return callback(error);
      callback(null, this._oneResult ? results[0] : results);
    });
  }

  /**
  If there is a global type 'Promise' available, use it; otherwise, throw an exception.
  */
  executePromise(): PromiseLike<R> {
    if (typeof Promise !== 'undefined') {
      return new Promise<R>((resolve, reject) => {
        this.execute((error, result) => error ? reject(error) : resolve(result));
      });
    }
    throw new TypeError('"Promise" is not an available type');
  }

  clone(): this {
    var copy = Object.create(this.constructor.prototype);
    copy.connection = this.connection;
    copy.statement = clone(this.statement);
    copy.parameters = clone(this.parameters);
    copy.parameters_i = this.parameters_i;
    copy._oneResult = this._oneResult;
    return copy;
  }

  abstract toSQL(): string;

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
  protected interpolateQuestionMarks(sql: string, args: any[]) {
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

  protected nextParameterName() {
    return (this.parameters_i++).toString();
  }
}

export default Command;
