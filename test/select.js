/*jslint node: true */
var tap = require('tap');

var Select = require('../commands/select').Select;

tap.test('Select SQL', function(t) {
  var select = new Select('users');
  t.equal(select._sql(), 'SELECT * FROM users', 'blank sql should render simply');

  var select_limit = select.limit(100);
  t.equal(select_limit.toUnsafeSQL(), 'SELECT * FROM users LIMIT 100', 'limit should be appended');

  t.end();
});
