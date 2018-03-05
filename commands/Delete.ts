import Command from '../Command'

export default class Delete extends Command<any[]> {
  constructor(table: string) {
    super()
    this.statement.table = table
    this.statement.wheres = []
  }

  toSQL() {
    const parts = ['DELETE FROM', this.statement.table]
    if (this.statement.wheres.length > 0) {
      parts.push('WHERE', this.statement.wheres.join(' AND '))
    }
    return parts.join(' ')
  }

  _where(sql: string, ...args: any[]) {
    const interpolatedSql = this.interpolateQuestionMarks(sql, args)
    this.statement.wheres.push(interpolatedSql)
    return this
  }
  where(sql: string, ...args: any[]) {
    return this.clone()._where(sql, ...args)
  }

  _whereEqual(hash: {[index: string]: any}) {
    for (const column in hash) {
      const value = hash[column]
      if (value !== undefined) {
        this.statement.wheres.push(`${column} = $${column}`)
        this.parameters[column] = value
      }
    }
    return this
  }
  /**
  Just like Select._whereEqual, be careful with the keys.
  */
  whereEqual(hash: {[index: string]: any}) {
    return this.clone()._whereEqual(hash)
  }
}
