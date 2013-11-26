FileImporter = require '../index'
path = require 'path'
importer = new FileImporter {
  path : path.join __dirname, 'statics'
  host : 'vicanso.com'
  # convertExts : 
  #   src : ['.coffee']
  #   dst : ['.js']
}
importer.importJs('/javascripts/main.coffee')
# importer.importJs('/javascripts/sub.coffee')
# importer.importJs('/javascripts/utils.coffee')

console.dir importer.exportJs()