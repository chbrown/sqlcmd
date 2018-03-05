import Command from '../Command'

export abstract class SelectBase<R> extends Command<R> {
  constructor(table: string) {
    super()
    this.statement.table = table
    this.statement.columns = []
    this.statement.wheres = []
    this.statement.group_bys = []
    this.statement.order_bys = []
  }

  toSQL() {
    const parts = ['SELECT']
    // add columns
    if (this.statement.columns.length === 0) {
      parts.push('*')
    }
    else {
      parts.push(this.statement.columns.join(', '))
    }
    // from table
    parts.push('FROM', this.statement.table)
    // where ...
    if (this.statement.wheres.length > 0) {
      parts.push('WHERE', this.statement.wheres.join(' AND '))
    }
    // group by ...
    if (this.statement.group_bys.length > 0) {
      parts.push('GROUP BY', this.statement.group_bys.join(', '))
    }
    // order by ...
    if (this.statement.order_bys.length > 0) {
      parts.push('ORDER BY', this.statement.order_bys.join(', '))
    }
    // limit
    if (this.statement.limit) {
      parts.push('LIMIT', this.statement.limit)
    }
    // offset
    if (this.statement.offset) {
      parts.push('OFFSET', this.statement.offset)
    }
    return parts.join(' ')
  }

  _add(...columns: string[]) {
    this.statement.columns.push(...columns)
    return this
  }
  add(...columns: string[]) {
    return this.clone()._add(...columns)
  }

  _where(sql: string, ...args: any[]) {
    const interpolatedSql = this.interpolateQuestionMarks(sql, args)
    this.statement.wheres.push(interpolatedSql)
    return this
  }
  /**
  Add a WHERE statement to be AND-merged with any other WHERE statements.

  sql
    Any SQL expression that evaluates to a truth value. It may contain multiple
    "?" placeholders -- as many ?'s as there are items in the args array.
  args
    SQL parameters to accompany the given SQL expression [optional]

  See also: Select#_whereEqual(...)
  */
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
  This functions just like calling where() several times with simple
  ('column = ?', value) pairs. Be careful with this one! only the hash's
  values will be escaped, so SQL injection is totally possible with the keys.
  */
  whereEqual(hash: {[index: string]: any}) {
    return this.clone()._whereEqual(hash)
  }

  _whereIn(column: string, list: any[]) {
    if (list.length > 0) {
      const inlist = list.map((item) => {
        const name = this.nextParameterName()
        this.parameters[name] = item
        return `$${name}`
      }).join(', ')
      this.statement.wheres.push(`${column} IN (${inlist})`)
    }
    else {
      // 0-length lists get special treatment.
      // something is never an element of the empty list, but 'WHERE x IN ()'
      // is a syntax error, not FALSE, in PostgreSQL
      this.statement.wheres.push('FALSE')
    }
    return this
  }
  /**
  Though ugly, apparently this is just how it works:

  https://github.com/brianc/node-postgres/issues/431

  Ends up with something like 'x IN($arg1, $arg2, $arg3)' and then
    {arg1: 'a', arg2: 'b', arg3: 'c'} in the properties
  Thus, each item in list is escaped (but column is not)

  An easier way is to use something like x = ANY($someArray)
  */
  whereIn(column: string, list: any[]) {
    return this.clone()._whereIn(column, list)
  }

  _groupBy(...columns: string[]) {
    this.statement.group_bys.push(...columns)
    return this
  }
  /** Vulnerable to SQL injection! */
  groupBy(...columns: string[]) {
    return this.clone()._groupBy(...columns)
  }

  _orderBy(...columns: string[]) {
    this.statement.order_bys.push(...columns)
    return this
  }
  /** Vulnerable to SQL injection! */
  orderBy(...columns: string[]) {
    return this.clone()._orderBy(...columns)
  }

  _offset(offset: number) {
    this.statement.offset = '$offset'
    this.parameters.offset = offset
    return this
  }
  offset(offset: number) {
    return this.clone()._offset(offset)
  }

  _limit(limit: number) {
    this.statement.limit = '$limit'
    this.parameters.limit = limit
    return this
  }
  limit(limit: number) {
    return this.clone()._limit(limit)
  }
}

export default class Select extends SelectBase<any[]> { }

export class SelectOne extends SelectBase<any> {
  constructor(table: string) {
    super(table)
    this.statement.limit = '1'
    this._oneResult = true
  }
}
