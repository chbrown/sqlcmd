import Insert from './Insert';

/**
The user is still responsible for adding the .returning('*') clause.
*/
export default class InsertOne extends Insert {
  constructor(table: string) {
    super(table);
  }
  execute(callback) {
    return this.connection.executeCommand(this, function(err, rows) {
      if (err) return callback(err);
      if (rows.length === 0) return callback(null);

      callback(null, rows[0]);
    });
  }
}
