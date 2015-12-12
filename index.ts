import {EventEmitter} from 'events';

import Command from './Command';

import CreateTable from './commands/CreateTable';
import Delete from './commands/Delete';
import Insert from './commands/Insert';
import InsertOne from './commands/InsertOne';
import Select from './commands/Select';
import SelectOne from './commands/SelectOne';
import Update from './commands/Update';
import UpdateOne from './commands/UpdateOne';

export type ConnectionOptions = any;
export type Command = Command;

/**
Connection provides a single interface to functionality of sqlcmd, and stores
configuration defaults to be used with every query. The options are unused in
sqlcmd; only sqlcmd-pg, sqlcmd-sqlite3, etc., use the options argument.

Events:
  .on('log', (log_level, message, ...args) => { ... })

*/
export class Connection extends EventEmitter {
  constructor(public options: ConnectionOptions) {
    super();
  }

  /**
  Execute a sqlcmd Command instance against this connection. Usually called by
  Command#execute() after the Command instance has been initialized with a
  sqlcmd.Connection.
  */
  executeCommand(command: Command,
                 callback: (error: Error, rows?: any[]) => void) {
    throw new Error('not implemented');
  }

  /**
  Execute a plain SQL query, potentially with prepared parameters, against this
  sqlcmd.Connection.
  */
  executeSQL(sql: string,
             args: any[] | {[index: string]: any},
             callback: (error: Error, rows?: any[]) => void) {
    throw new Error('not implemented');
  }

  CreateTable(table: string) {
    var command = new CreateTable(table);
    command.connection = this;
    return command;
  }

  Delete(table: string) {
    var command = new Delete(table);
    command.connection = this;
    return command;
  }

  Insert(table: string) {
    var command = new Insert(table);
    command.connection = this;
    return command;
  }

  InsertOne(table: string) {
    var command = new InsertOne(table);
    command.connection = this;
    return command;
  }

  Select(table: string) {
    var command = new Select(table);
    command.connection = this;
    return command;
  }

  SelectOne(table: string) {
    var command = new SelectOne(table);
    command.connection = this;
    return command;
  }

  Update(table: string) {
    var command = new Update(table);
    command.connection = this;
    return command;
  }

  UpdateOne(table: string) {
    var command = new UpdateOne(table);
    command.connection = this;
    return command;
  }
}
