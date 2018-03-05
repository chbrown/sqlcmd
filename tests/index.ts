import {Connection as BaseConnection, Command} from '..'

export class Connection extends BaseConnection {
  executeSQL(sql: string, args: any[], callback: (error: Error, rows?: any[]) => void): void {
    return
  }

  executeCommand<R>(command: Command<R>,
                    callback: (error: Error, result?: R) => void): void {
    return callback(null, null)
  }
}
