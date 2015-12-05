import Command, {addCloningMethods} from '../Command';

export default class Select extends Command {
  constructor(table: string) {
    super();
    this.statement.table = table;
    this.statement.columns = [];
    this.statement.wheres = [];
    this.statement.group_bys = [];
    this.statement.order_bys = [];
  }
  toSQL() {
    var parts = ['SELECT'];
    // add columns
    if (this.statement.columns.length === 0) {
      parts.push('*');
    }
    else {
      parts.push(this.statement.columns.join(', '));
    }
    // from table
    parts.push('FROM', this.statement.table);
    // where ...
    if (this.statement.wheres.length > 0) {
      parts.push('WHERE', this.statement.wheres.join(' AND '));
    }
    // group by ...
    if (this.statement.group_bys.length > 0) {
      parts.push('GROUP BY', this.statement.group_bys.join(', '));
    }
    // order by ...
    if (this.statement.order_bys.length > 0) {
      parts.push('ORDER BY', this.statement.order_bys.join(', '));
    }
    // limit
    if (this.statement.limit) {
      parts.push('LIMIT', this.statement.limit);
    }
    // offset
    if (this.statement.offset) {
      parts.push('OFFSET', this.statement.offset);
    }
    return parts.join(' ');
  }
  _add(...columns) {
    this.statement.columns.push(...columns);
    return this;
  }
  /** Select#_where(sql: string, ...args: any[])

  Add a WHERE statement to be AND-merged with any other WHERE statements.

  sql
    Any SQL expression that evaluates to a truth value. It may contain multiple
    "?" placeholders -- as many ?'s as there are items in the args array.
  args
    SQL parameters to accompany the given SQL expression [optional]

  See also: Select#_whereEqual(...)
  */
  _where(sql, ...args) {
    sql = this.interpolateQuestionMarks(sql, args);
    this.statement.wheres.push(sql);

    return this;
  }
  _whereEqual(hash) {
    /**
    This functions just like calling where() several times with simple
    ('column = ?', value) pairs. Be careful with this one! only the hash's
    values will be escaped, so SQL injection is totally possible with the keys.
    */
    for (var column in hash) {
      var value = hash[column];
      if (value !== undefined) {
        this.statement.wheres.push(column + ' = $' + column);
        this.parameters[column] = value;
      }
    }
    return this;
  }
  _whereIn(column, list) {
    /** Though ugly, apparently this is just how it works:

    https://github.com/brianc/node-postgres/issues/431

    Ends up with something like 'x IN($arg1, $arg2, $arg3)' and then
      {arg1: 'a', arg2: 'b', arg3: 'c'} in the properties
    Thus, each item in list is escaped (but column is not)
    */
    if (list.length > 0) {
      var inlist = list.map((item) => {
        var name = this.nextParameterName();
        this.parameters[name] = item;
        return '$' + name;
      }).join(', ');
      this.statement.wheres.push(column + ' IN (' + inlist + ')');
    }
    else {
      // 0-length lists get special treatment.
      // something is never an element of the empty list, but 'WHERE x IN ()'
      // is a syntax error, not FALSE, in PostgreSQL
      this.statement.wheres.push('FALSE');
    }
    return this;
  }
  /** Vulnerable to SQL injection! */
  _groupBy(...columns) {
    this.statement.group_bys.push(...columns);
    return this;
  }
  /** Vulnerable to SQL injection! */
  _orderBy(...columns) {
    this.statement.order_bys.push(...columns);
    return this;
  }
  _offset(offset) {
    this.statement.offset = '$offset';
    this.parameters.offset = offset;
    return this;
  }
  _limit(limit) {
    this.statement.limit = '$limit';
    this.parameters.limit = limit;
    return this;
  }

}

addCloningMethods(Select, [
  'add',
  'where',
  'whereEqual',
  'whereIn',
  'groupBy',
  'orderBy',
  'offset',
  'limit',
]);
