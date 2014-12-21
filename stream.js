/*jslint node: true */
var util = require('util');
var stream = require('stream');

var Result = require('pg/lib/result');
var prepareValue = require('pg/lib/utils').prepareValue;

// Composed of https://github.com/brianc/node-pg-cursor/blob/master/index.js
// and https://github.com/brianc/node-pg-query-stream/blob/master/index.js

var QueryStream = module.exports = function(text, values, options) {
  /**
  text: string     // SQL parameterized query
  values: any[]    // query parameters

  Example:

      var query_stream = new QueryStream('SELECT * FROM users', []);
      client.query(query_stream);

  Since query_stream has a .submit function(), client will call it with the current connection:

      // this is called by pg code
      query_stream.submit(client.connection)

  */
  stream.Readable.call(this, {
    objectMode: true,
    highWaterMark: options.highWaterMark,
  });
  this.text = text;
  this.values = Array.isArray(values) ? values.map(prepareValue) : null;
  this.connection = null;
  this._result = new Result();

  this.portalName = options && options.portalName || '';
};
util.inherits(QueryStream, stream.Readable);

QueryStream.prototype._read = function(size) {
  // the query_stream is marked ready by this.connection being set
  if (this.connection) {
    this.connection.execute({rows: size, portal: this.portalName}, true);
    this.connection.flush();
  }
  else {
    this._readableState.reading = false;
  }
};

QueryStream.prototype.submit = function(connection) {
  /** The pg.Client will call query.submit(connection) when the connection is
  available to run this query. The client will remain busy until the connection
  emits 'readyForQuery'.
  */
  this.connection = connection;
  this.connection.parse({text: this.text}, true);
  this.connection.bind({values: this.values, portal: this.portalName}, true);
  this.connection.describe({type: 'P', name: this.portalName}, true);
  this.connection.flush();

  // if _read was called before the connection, it will have halted and be
  // awaiting data before it calls _read again
  this.read(0);

  this.on('end', function() {
    connection.end();
  });
};

QueryStream.prototype.close = function() {
  this.connection.close({type: 'P'});
  this.connection.sync();
  // this.connection.once('closeComplete', function() {});
};

QueryStream.prototype.handleRowDescription = function(msg) {
  this._result.addFields(msg.fields);
};
QueryStream.prototype.handleDataRow = function(msg) {
  var row = this._result.parseRow(msg.fields);
  this._readableState.buffer.push(row);
  this._readableState.length++;
};
QueryStream.prototype.handleCommandComplete = function() {
  this.connection.sync(); // tell the connection we're done
};
QueryStream.prototype.handlePortalSuspended = function() {
  this._readableState.reading = false; // emulate successful .push()
  this.read(0); // trigger flush and further reads
};
QueryStream.prototype.handleReadyForQuery = function() {
  this.push(null); // tell the stream we're done
};
QueryStream.prototype.handleError = function(msg) {
  this.emit('error', msg);
  this.connection.sync(); // tell the connection we're done
};
