[![Travis CI Build Status](https://travis-ci.org/chbrown/sqlcmd.svg)](https://travis-ci.org/chbrown/sqlcmd)

# sqlcmd

Coarse-grained compositional SQL.

    npm install --save sqlcmd

Currently only supports [PostgreSQL](http://www.postgresql.org/), via [pg](https://github.com/brianc/node-postgres).

## Examples


### Configuration

With options object:

    var sqlcmd = require('sqlcmd');

    var db = new sqlcmd.Connection({
      host: 'localhost',
      user: 'chbrown',
      database: 'friends',
    });

You can also use the connection string format:

    var db = new sqlcmd.Connection('postgres://chbrown@localhost/friends')

However, you must create the connection with the options object if you want to use any of the administrative helpers:

* `initializeDatabase`
* `databaseExists`
* `createDatabase`
* `dropDatabase`


### Administrative helpers

Suppose there's a `schema.sql` file in the current directory, containing all the `CREATE TABLE`'s, indices, etc., for your database.

    db.initializeDatabase('schema.sql', function(err) {
      if (err) console.log('Error initializing database: %s', err);

      console.log('Initialized database');
    });

This will use the same connection options that were specified when creating the `db` connection, except it will connect to PostgreSQL's special `postgres` database instead of the database ("friends") we specified.

* `initializeDatabase` checks if the "friends" database exists via `databaseExists`, and then runs `createDatabase` if needed, followed by reading the `schema.sql` file as UTF-8 and executing it as a single query.
* `databaseExists` checks if the database exists by looking at the `pg_catalog.pg_database` table.
* `createDatabase` issues a `CREATE DATABASE ...` command.
* `dropDatabase` issues a `DROP DATABASE ...` command.

These commands are all unsafe, and are vulnerable to SQL injection via the database name or the contents of `schema.sql`.


### Basic queries

`Select()`, `Insert()`, `Update()`, and `Delete()` are all functions of `db` that take a single argument, the name of the table they are operating on, and return a different type of query object.

I've elided error handling below, for concision, but in practice that's a recipe for disaster, or at least a really awful debugging experience.

    var user_name = 'Chris';

    db.Select('friendships')
    .where('source = ? OR target = ?', user_name, user_name)
    .execute(function(err, friendships) {
      console.log("All of Chris's connections: %j", friendships);
    });

    db.Insert('friendships')
    .set({source: 'Chris', target: 'Jess'})
    .execute(function(err, rows) {
      // Insert() adds "RETURNING *" to the query, so we get back a list of one row.
      console.log('inserted row: %j', rows[0]);
    });

TODO: more documentation. (When is that not a TODO?)


## License

Copyright 2014 Christopher Brown. [MIT Licensed](http://opensource.org/licenses/MIT).
