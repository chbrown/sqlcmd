import Command from '../Command';

export default class CreateTable extends Command<any[]> {
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

  _add(...columns: string[]) {
    this.statement.columns.push(...columns);
    return this;
  }
  add(...columns: string[]) {
    return this.clone()._add(...columns);
  }

  _ifNotExists() {
    this.statement.if_not_exists = true;
    return this;
  }
  ifNotExists() {
    return this.clone()._ifNotExists();
  }
}
