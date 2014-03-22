/*jslint node: true */
var tap = require('tap');

var Select = require('../commands/select').Select;

var unprepare = function(obj) {
  return obj.sql.replace(/\$(\d+)/g, function(m, g) {
    var index = parseInt(g, 10) - 1;
    return obj.args[index];
  });
};

tap.test('Select SQL', function(t) {
  var select = new Select('users');
  t.equal(select._sql(), 'SELECT * FROM users', 'blank sql should render simply');

  var select_limit = select.limit(100);
  t.equal(unprepare(select_limit._prepare()), 'SELECT * FROM users LIMIT 100', 'limit should be appended');

  t.end();
});
