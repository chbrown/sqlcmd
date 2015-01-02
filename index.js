/*jslint node: true */
var Connection = require('./connection');

/** set up default connection, so that the user can say:

    var sqlcmd = require('sqlcmd');
    sqlcmd.Select('users').toString();

As well as:

    var sqlcmd = require('sqlcmd');
    var db = new sqlcmd.Connection({...});
    db.Select('users').toString();

Without too much code duplication.

*/
var sqlcmd = module.exports = new Connection({});
sqlcmd.Connection = Connection;
