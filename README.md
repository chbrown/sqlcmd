# sqlcmd

[![Travis CI Build Status](https://travis-ci.org/chbrown/sqlcmd.svg)](https://travis-ci.org/chbrown/sqlcmd)
[![npm version](https://badge.fury.io/js/sqlcmd.svg)](https://badge.fury.io/js/sqlcmd)

Coarse-grained partially composable SQL.

    npm install --save sqlcmd


### Basic queries

    import {Connection} from 'sqlcmd';
    const db = new Connection();

`Select()`, `Insert()`, `Update()`, and `Delete()` are all functions of `db` that take a single argument, the name of the table they are operating on, and return a different type of query object.

The examples below assume a connection is available somewhere, which is not shown. See [sqlcmd-pg](https://github.com/chbrown/sqlcmd-pg) for a complete example.

I've elided error handling below, for concision, but in practice that's a recipe for disaster, or at least a really awful debugging experience.

    var user_name = 'Chris';

    db.Select('friendships')
    .where('source = ? OR target = ?', user_name, user_name)
    .execute((err, friendships) => {
      console.log("All of Chris's connections: %j", friendships);
    });

    db.Insert('friendships')
    .set({source: 'Chris', target: 'Jess'})
    .returning('*')
    .execute((err, rows) => {
      // we've asked for "RETURNING *", so we get back a list of one row.
      console.log('inserted row: %j', rows[0]);
    });

TODO: more documentation. (When is that not a TODO?)


## Ideas

Every SQL command is an instance of a general SQL Command class, and can be modified (mutated) or built upon to create new instances. SQL syntax is regular, but we want to be able to build commands (especially queries) incrementally.

Most SQL databases loosely adhere to a standard, but every implementation has extensions or flexibility for better compatibility. This library does not make provisions for different implementations. Instead, it is string-based, so if you use it to create a table, you need to know what types and constraints your database implementation supports.


## Commands

SQL parameterization embeds references to external objects in plain strings.
Strings are just arrays of characters, so a parameterized string is just an array of strings interspersed with parameter objects.
We could model those sequences as an array of stuff like "SqlString" and "SqlParameter" instances, but since pg and sqlite3 both distinguish between the query string and a parameters object/array when performing queries, we'll use a similar model. When

`sqlcmd` comes with several built-in commands. These classes have both mutable and immutable interfaces; the mutable interface uses method names prefixed by `_`. These methods modify the command instance's statement and/or parameters and `return this;`, so that they're chainable. The non-prefixed methods clone the command instance first, and then perform the mutable command on the newly created copy, returning the copy and leaving the original command untouched. Every command must also implement the `Command#toSQL()`, which takes no arguments and returns a single string. It does not modify the command.


## License

Copyright 2014-2015 Christopher Brown. [MIT Licensed](http://chbrown.github.io/licenses/MIT/#2014-2015).
