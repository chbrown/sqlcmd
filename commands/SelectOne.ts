import Select from './Select';

export default class SelectOne extends Select {
  constructor(table: string) {
    super(table);
    this.statement.limit = '1';
  }
  execute(callback) {
    return this.connection.executeCommand(this, (error, rows) => {
      if (error) return callback(error);
      if (rows.length === 0) return callback(null);

      callback(null, rows[0]);
    });
  }
}
