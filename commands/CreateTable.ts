import Command, {addCloningMethods} from '../Command';

export default class CreateTable extends Command {
  constructor(table: string) {
    super();
    this.statement.table = table;
    this.statement.if_not_exists = false;
    this.statement.columns = [];
  }
  toSQL() {
    var parts = ['CREATE TABLE'];

    if (this.statement.if_not_exists) {
      parts.push('IF NOT EXISTS');
    }

    parts.push(this.statement.table, '(', this.statement.columns.join(', '), ')');
    return parts.join(' ');
  }
  _add(columns) {
    this.statement.columns.push(...columns);
    return this;
  }
  _ifNotExists() {
    this.statement.if_not_exists = true;
    return this;
  }
}

addCloningMethods(CreateTable, [
  'add',
  'ifNotExists',
]);
