import Command from '../Command';

export default class Insert extends Command {
  constructor(table: string) {
    super();
    this.statement.table = table;
    this.statement.columns = [];
    // values should be as long as columns; it'll often be $variables, but not necessarily
    this.statement.values = [];
    this.statement.returning = [];
  }

  /**
  Generates a string like:
    INSERT INTO responses (user_id, experiment_id, stimulus_id, value)
      VALUES ($1, $2, $3, $4)
  */
  toSQL() {
    var parts = ['INSERT INTO', this.statement.table];
    // no columns means ALL columns, in default order
    if (this.statement.columns.length > 0) {
      parts.push('(' + this.statement.columns.join(', ') + ')');
    }
    // no values means defaults only
    if (this.statement.values.length === 0) {
      parts.push('DEFAULT VALUES');
    }
    else {
      parts.push('VALUES (' + this.statement.values.join(', ') + ')');
    }

    if (this.statement.returning.length > 0) {
      // not default since sqlite can't handle it
      parts.push('RETURNING', this.statement.returning.join(', '));
    }

    return parts.join(' ');
  }

  _add(column: string, value: any) {
    this.statement.columns.push(column);
    this.parameters[column] = value;
    this.statement.values.push('$' + column);
    return this;
  }
  add(column: string, value: any) {
    return this.clone()._add(column, value);
  }

  _set(hash: {[index: string]: any}) {
    for (var column in hash) {
      var value = hash[column];
      if (value !== undefined) {
        this._add(column, value);
      }
    }
    return this;
  }
  /**
  This function presumes that all hash keys are safe, and all object values are unsafe.

  Ignores undefined values.
  */
  set(hash: {[index: string]: any}) {
    return this.clone()._set(hash);
  }

  _returning(...columns: string[]) {
    this.statement.returning.push(...columns);
    return this;
  }
  /**
  Call like:

      db.Insert('users').set({name: 'Chris'}).returning('*')

  to get back the full inserted row. Useful if you want the primary key or
  other generated / default values.
  */
  returning(...columns: string[]) {
    return this.clone()._returning(...columns);
  }
}
