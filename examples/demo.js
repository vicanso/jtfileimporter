(function() {
  var FileImporter, importer, path;

  FileImporter = require('../index');

  path = require('path');

  importer = new FileImporter({
    path: path.join(__dirname, 'statics'),
    host: 'vicanso.com'
  });

  importer.importJs('/javascripts/main.coffee');

  console.dir(importer.exportJs());

}).call(this);
