# `1.0.5` (2015-01-07)

* Calling `Database#all(sql_string, null, callback)` would fail in SQLite when called in the `Connection#executePatches(...)` method. Using `[]` to denote empty parameters instead of `null` when calling `Connection#executeSQL(sql_string, [], callback)` solves this problem in SQLite as well as being cross-compatible with PostgreSQL.


# `1.0.4` (2015-01-07)

* Remove overloaded function call `Connection#executeSQL(sql_string, callback)`, so that only the parameterized version is allowed.


# `1.0.3` (2015-01-02)

* Add missing error-handling conditional in the `Connection#executeSQL(...)` callback inside the `Connection#executePatches(...)` method.


# `1.0.2` (2015-01-02)

* SQLite does not support `RETURNING *` SQL syntax in `INSERT` and `UPDATE` queries. **This patch removes the `RETURNING *` default in the `db.Insert(...)` and `db.Update(...)` commands, and adds `Insert#returning(...columns)` and `Update#returning(...columns)` commands** (which are also overloaded as `Insert#returning(columns)` and `Update#returning(columns)`).


# `1.0.1` (2015-01-02)

* Add `CreateTable#ifNotExists()` method.
* Make `Connection` inherit from `EventEmitter` (for logging purposes).


# `1.0.0` (2015-01-02)

* Refactor PostgreSQL-dependent functionality into the [`sqlcmd-pg`](https://github.com/chbrown/sqlcmd-pg) library, allowing the `sqlcmd` query construction logic to be used across various SQL database engines, such as [SQLite](https://github.com/chbrown/sqlcmd-sqlite3) and [raw strings](https://github.com/chbrown/sqlcmd-sql).
* Restructure `Command` classes to store all of the query's structural data in a `statement` property, enabling simpler and more concise cloning when using the immutable modality.
* **Rename `Update#set(mapping)` to `Update#setEqual(mapping)` and add a new `Update#set(sql, args)` command**, similar to `Select#where(sql, args)`, since SQL `UPDATE` queries are not restricted to key-value settings.
