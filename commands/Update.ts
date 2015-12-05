import Command, {addCloningMethods} from '../Command';

export default class Update extends Command {
  constructor(table: string) {
    super();
    this.statement.table = table;
    this.statement.sets = []; // equations / equalities (column-expression pairs)
    this.statement.wheres = [];
    this.statement.returning = [];
  }

  /** Update#toSQL()

  Generates a string like:
    UPDATE users SET ip = $1, user_agent = $2 WHERE id = $3
  */
  toSQL() {
    var parts = ['UPDATE', this.statement.table];
    if (this.statement.sets.length > 0) {
      parts.push('SET', this.statement.sets.join(', '));
    }
    if (this.statement.wheres.length > 0) {
      parts.push('WHERE', this.statement.wheres.join(' AND '));
    }

    if (this.statement.returning.length > 0) {
      parts.push('RETURNING', this.statement.returning.join(', '));
    }

    return parts.join(' ');
  }

  _where(sql, ...args) {
    sql = this.interpolateQuestionMarks(sql, args);
    this.statement.wheres.push(sql);

    return this;
  }

  /** Update#_whereEqual(hash: any)

  Just like Select._whereEqual
  */
  _whereEqual(hash) {
    for (var column in hash) {
      var value = hash[column];
      if (value !== undefined) {
        this.statement.wheres.push(column + ' = $' + column);
        this.parameters[column] = value;
      }
    }
    return this;
  }

  /** Update#_set(sql: string, args: any[])

  SQL can do more than just stuff like "... SET name = 'Chris' ...", it can also
  increment, e.g., "... SET counter = counter + 1 ...", so we call this _set,
  and have a separate _setEqual
  */
  _set(sql, ...args) {
    sql = this.interpolateQuestionMarks(sql, args);
    this.statement.sets.push(sql);

    return this;
  }

  /** Update#_setEqual(hash: object)

  Given a hash like
      {
        artist: 'Nathaniel Merriweather',
        title: 'Strangers On A Train'
      }

  Add this.statement.sets like:
      [
        'artist = $artist',
        'title = $title',
      ]

  While extending the parameters with:
      {
        artist: 'Nathaniel Merriweather',
        title: 'Strangers On A Train',
      }

  This function presumes that all object keys are safe, and all object values are unsafe.
  In this way, it's a lot like the Select#_whereEqual() method

  If that's not true, you should add values to `this.eqs` directly.
  */
  _setEqual(hash) {
    for (var column in hash) {
      var value = hash[column];
      if (value !== undefined) {
        this.statement.sets.push(column + ' = $' + column);
        this.parameters[column] = value;
      }
    }
    return this;
  }

  /** Update#_returning(...columns: string[])

  Call like:

      db.Update('users').set({active: false}).returning('*')

  to get back all updated rows.
  */
  _returning(...columns) {
    this.statement.returning.push(...columns);
    return this;
  }
}

addCloningMethods(Update, [
  'where',
  'whereEqual',
  'set',
  'setEqual',
  'returning',
]);
