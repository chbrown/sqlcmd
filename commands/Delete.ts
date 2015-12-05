import Command, {addCloningMethods} from '../Command';

export default class Delete extends Command {
  constructor(table: string) {
    super();
    this.statement.table = table;
    this.statement.wheres = [];
  }

  toSQL() {
    var parts = ['DELETE FROM', this.statement.table];
    if (this.statement.wheres.length > 0) {
      parts.push('WHERE', this.statement.wheres.join(' AND '));
    }
    return parts.join(' ');
  }

  _where(sql, ...args) {
    var args = [];

    sql = this.interpolateQuestionMarks(sql, args);
    this.statement.wheres.push(sql);
    return this;
  }

  /** Delete#_whereEqual(hash: object)

  Just like Select._whereEqual: be careful with the keys.
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
}

addCloningMethods(Delete, [
  'where',
  'whereEqual',
]);
