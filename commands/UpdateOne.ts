import Command from '../Command';
import Update from './Update';

export default class UpdateOne extends Update {
  execute(callback) {
    return this.connection.executeCommand(this, (error, rows) => {
      if (error) return callback(error);
      if (rows.length === 0) return callback(null);

      callback(null, rows[0]);
    });
  }
}
