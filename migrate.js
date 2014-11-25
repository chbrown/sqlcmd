/*jslint node: true */
var fs = require('fs');
var path = require('path');

module.exports = function(db, patches_table, patches_dirpath, callback) {
  /** migrate: apply sql patches to a database exactly once

  1) Given a directory of sql files
  2) Find which ones have not been applied to the database
  3) Apply the new sql files to the database as needed, in alphabetical order
  4) Record which files have been applied to the database in a special table

  There is no up / down distinction, only applied / not-yet-applied.

    db: Connection
    patches_table: string
    patches_dirpath: string
    callback: (error?: Error)
  */
  var create_table_sql = [
    'CREATE TABLE IF NOT EXISTS ' + patches_table + ' (',
    '  id SERIAL PRIMARY KEY,',
    '  filename TEXT NOT NULL,',
    '  applied TIMESTAMP DEFAULT current_timestamp NOT NULL',
    ')',
  ].join('\n');
  db.query(create_table_sql, [], function(err) {
    if (err) return callback(err);
    fs.readdir(patches_dirpath, function(err, filenames) {
      if (err) return callback(err);

      db.Select(patches_table).execute(function(err, patches) {
        if (err) return callback(err);
        // patches: {id: number, filename: string, applied: Date}[]
        // applied_filenames: string[]
        var applied_filenames = patches.map(function(patch) {
          return patch.filename;
        });

        var unapplied_filenames = filenames.filter(function(filename) {
          return applied_filenames.indexOf(filename) === -1 && filename.match(/\.sql$/);
        }).sort();

        (function loop() {
          var unapplied_filename = unapplied_filenames.shift();
          // path.basename()
          if (unapplied_filename === undefined) {
            return callback();
          }
          else {
            var unapplied_filepath = path.join(patches_dirpath, unapplied_filename);
            db.executeSQLFile(unapplied_filepath, function(err, sql) {
              if (err) return callback(err);

              db.Insert(patches_table)
              .set({filename: unapplied_filename})
              .execute(function(err, patches) {
                if (err) return callback(err);

                loop();
              });
            });
          }
        })();
      });
    });
  });
};
