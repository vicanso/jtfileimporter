assert = require 'assert'
jsc = require 'jscoverage'
fileImporterFile = '../dest/fileimporter'

if process.env.NODE_ENV == 'cov'
  FileImporter = jsc.require module, fileImporterFile
else
  FileImporter = require fileImporterFile

fileImporter = new FileImporter()
describe 'FileImporter', ->
  describe '#hosts', ->
    it 'should set hosts successful', ->
      
      hosts = 'vicanso.com'
      fileImporter.hosts hosts
      assert.equal hosts, fileImporter.hosts().join ''

      hosts = ['vicanso.com', 'jenny.com']
      fileImporter.hosts hosts
      assert.equal hosts.join(''), fileImporter.hosts().join ''

  describe '#version', ->
    it 'should set version successful', ->
      versionConfig = '12345'
      fileImporter.version versionConfig
      assert.equal versionConfig, fileImporter.version()

      versionConfig = ['123', '456']
      fileImporter.version versionConfig
      assert.equal versionConfig.join(''), fileImporter.version().join('')

  describe '#getFiles, #importCss, #importJs, #importFile', ->
    it 'should be done successful', ->
      jsFile = '1.js'
      fileImporter.importJs jsFile
      assert.equal jsFile, fileImporter.getFiles 'js'

      cssFiles = ['1.css', '2.css']
      fileImporter.importCss cssFiles
      assert.equal cssFiles.join(''), fileImporter.getFiles('css').join ''
  describe '#exportCss, #exportJs', ->
    it 'should be export successful', ->
      importer = new FileImporter()
      jsFiles = ['1.js', '2.js']
      importer.importJs jsFiles
      exportJsStr = '<script type="text/javascript" src="1.js"></script><script type="text/javascript" src="2.js"></script>'
      assert.equal exportJsStr, importer.exportJs()
      importer.version '123'
      exportJsStr = '<script type="text/javascript" src="1.js?v=123"></script><script type="text/javascript" src="2.js?v=123"></script>'
      assert.equal exportJsStr, importer.exportJs()

      importer.hosts 'vicanso.com'
      exportJsStr = '<script type="text/javascript" src="http:/vicanso.com/1.js?v=123"></script><script type="text/javascript" src="http:/vicanso.com/2.js?v=123"></script>'
      assert.equal exportJsStr, importer.exportJs()

      importer.importJs '12.js'
      importer.hosts ['vicanso.com', 'jenny.com']
      exportJsStr = '<script type="text/javascript" src="http:/vicanso.com/1.js?v=123"></script><script type="text/javascript" src="http:/vicanso.com/2.js?v=123"></script><script type="text/javascript" src="http:/jenny.com/12.js?v=123"></script>'
      assert.equal exportJsStr, importer.exportJs()


      cssFiles = ['1.css', '2.css']
      importer.version ''
      importer.hosts null
      importer.importCss cssFiles
      exportCssStr = '<link rel="stylesheet" href="1.css" type="text/css" /><link rel="stylesheet" href="2.css" type="text/css" />'
      assert.equal exportCssStr, importer.exportCss()

      importer.debug true
      exportCssStr = '<link rel="stylesheet" href="/src/1.css" type="text/css" /><link rel="stylesheet" href="/src/2.css" type="text/css" />'
      assert.equal exportCssStr, importer.exportCss()
      importer.debug false


      importer.version {
        '1.css' : '123'
        '2.css' : '234'
      }
      exportCssStr = '<link rel="stylesheet" href="1.css?v=123" type="text/css" /><link rel="stylesheet" href="2.css?v=234" type="text/css" />'
      assert.equal exportCssStr, importer.exportCss()

  describe '#merger', ->
    it 'should merge file successful', ->
      merger = 
        getMergeExportFiles : (files) ->
          ['1-2.css']

      importer = new FileImporter merger

      importer.importCss ['1.css', '2.css']

      exportCssStr = '<link rel="stylesheet" href="1-2.css" type="text/css" />'
      assert.equal exportCssStr, importer.exportCss()
