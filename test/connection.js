/*jslint node: true */
var tap = require('tap');

var Connection = require('../').Connection;

tap.test('Create, test, and drop database', function(t) {
  var database = 'sqlcmd_database';
  console.error('creating database named %s; if tests fail, you may need to drop it manually', database);

  var connection = new Connection({database: database});
  connection.createDatabase(function(err) {
    console.error('created database');
    t.notOk(err, 'createDatabase should not return an error');
    connection.databaseExists(function(err, exists) {
      console.error('database exists?', exists);
      t.equal(exists, true, 'databaseExists should be true after creating it');
      connection.dropDatabase(function(err, exists) {
        console.error('dropped database');
        t.notOk(err, 'dropDatabase should not return an error');
        connection.databaseExists(function(err, exists) {
          console.error('database exists?', exists);
          t.equal(exists, false, 'databaseExists should be false after dropping it');
          t.end();
          // not sure what's hanging, but tap complains about timing out unless we exit manually
        });
      });
    });
  });
});
