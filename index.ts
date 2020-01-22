import {EventEmitter} from 'events'

import Command from './Command'

import CreateTable from './commands/CreateTable'
import Delete from './commands/Delete'
import Insert, {InsertOne} from './commands/Insert'
import Select, {SelectOne} from './commands/Select'
import Update, {UpdateOne} from './commands/Update'

export {Command}
export interface ConnectionOptions { }

export interface LogEvent {
  level: string
  format: string
  args: any[]
}

/**
Connection provides a single interface to functionality of sqlcmd, and stores
configuration defaults to be used with every query. The options are unused in
sqlcmd -- only sqlcmd-pg, sqlcmd-sqlite3, etc., use the options argument.

Events:
  .on('log', ({level, format, args}) => { ... })

*/
export abstract class Connection extends EventEmitter {
  constructor(public options: ConnectionOptions) {
    super()
  }

  /**
  Execute a sqlcmd Command instance against this connection. Usually called by
  Command#execute() after the Command instance has been initialized with a
  sqlcmd.Connection.
  */
  abstract executeCommand<R>(command: Command<R>,
                             callback: (error: Error, result?: R) => void): void

  /**
  Execute a plain SQL query, potentially with prepared parameters, against this
  sqlcmd.Connection.
  */
  abstract executeSQL(sql: string,
                      args: any[] | {[index: string]: any},
                      callback: (error: Error, rows?: any[]) => void): void

  CreateTable(table: string) {
    const command = new CreateTable(table)
    command.connection = this
    return command
  }

  Delete(table: string) {
    const command = new Delete(table)
    command.connection = this
    return command
  }

  Insert(table: string) {
    const command = new Insert(table)
    command.connection = this
    return command
  }

  InsertOne(table: string) {
    const command = new InsertOne(table)
    command.connection = this
    return command
  }

  Select(table: string) {
    const command = new Select(table)
    command.connection = this
    return command
  }

  SelectOne(table: string) {
    const command = new SelectOne(table)
    command.connection = this
    return command
  }

  Update(table: string) {
    const command = new Update(table)
    command.connection = this
    return command
  }

  UpdateOne(table: string) {
    const command = new UpdateOne(table)
    command.connection = this
    return command
  }
}
