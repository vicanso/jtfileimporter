"use strict";
const assert = require('assert');
const Importer = require('../lib/importer');

describe('Importer', function() {
  describe('#prefix', function() {
    it('should set prefix successful', function() {
      let importer = new Importer();
      let prefix = '/static';
      importer.prefix = prefix;
      assert.equal(prefix, importer.prefix);

      let cssFiles = ['1.css', 'http://baidu.com/1.css'];
      importer.import(cssFiles);
      assert.equal('<link rel="stylesheet" href="/static/1.css" type="text/css" /><link rel="stylesheet" href="http://baidu.com/1.css" type="text/css" />', importer.exportCss());
    });
  });


  describe('#hosts', function() {
    it('should set hosts successful', function() {
      let importer = new Importer();
      let host = 'vicanso.com';
      importer.hosts = host;
      assert(host, importer.hosts.join(''));

      let hosts = ['vicanso.com', 'jenny.com'];
      importer.hosts = hosts;
      assert.equal(hosts.join(''), importer.hosts.join(''));

      importer.hosts = null;
      assert.equal(importer.hosts, null);
    });
  });


  describe('#version', function() {
    it('should set version successful', function () {
      let importer = new Importer();
      let version = '12345';
      importer.version = version;
      assert.equal(version, importer.version);
    });
  });


  describe('#import, #exportsCss, #exportsJs', function () {
    it('should import file and export successful', function() {
      let importer = new Importer();
      let files = ['1.js', '2.js'];
      importer.import(files);
      importer.import('');
      let exportJsStr = '<script type="text/javascript" src="1.js"></script><script type="text/javascript" src="2.js"></script>';
      assert.equal(exportJsStr, importer.exportJs());

      // set version
      importer.version = '123';
      exportJsStr = '<script type="text/javascript" src="1.js?v=123"></script><script type="text/javascript" src="2.js?v=123"></script>';
      assert.equal(exportJsStr, importer.exportJs());

      // set hosts
      importer.hosts = 'vicanso.com';
      exportJsStr = '<script type="text/javascript" src="//vicanso.com/1.js?v=123"></script><script type="text/javascript" src="//vicanso.com/2.js?v=123"></script>';
      assert.equal(exportJsStr, importer.exportJs());


      importer.import('12.js');
      importer.hosts = ['vicanso.com', 'jenny.com'];
      exportJsStr = '<script type="text/javascript" src="//vicanso.com/1.js?v=123"></script><script type="text/javascript" src="//vicanso.com/2.js?v=123"></script><script type="text/javascript" src="//jenny.com/12.js?v=123"></script>';
      assert.equal(exportJsStr, importer.exportJs());


      importer = new Importer();
      importer.import('1.css', ['2.css']);
      var exportCssStr = '<link rel="stylesheet" href="1.css" type="text/css" /><link rel="stylesheet" href="2.css" type="text/css" />';
      assert.equal(exportCssStr, importer.exportCss());

      importer.version = {
        '1.css' : '123',
        'default' : '234'
      };
      exportCssStr = '<link rel="stylesheet" href="1.css?v=123" type="text/css" /><link rel="stylesheet" href="2.css?v=234" type="text/css" />';
      assert.equal(exportCssStr, importer.exportCss());

    });
  });


  describe('#getFiles', function () {
    it('should get files successful', function() {
      let importer = new Importer();
      importer.import('/1.css', '/2.css', '/global.css');
      importer.import('/1.js', '/2.js', '/3.js', '/4.js', '/jquery.min.js');
      let jsFiles = [ '/1.js', '/2.js', '/3.js', '/4.js', '/jquery.min.js' ];
      let cssFiles = ['/1.css', '/2.css', '/global.css'];
      assert.equal(importer.getFiles('js').join(''), jsFiles.join(''));
      assert.equal(importer.getFiles('css').join(''), cssFiles.join(''));
    });
  });


  describe('#merge', function(){
    it('should set merge info successful', function(){
      let importer = new Importer();
      importer.import('/1.css', '/2.css', '/global.css');
      importer.import('/1.js', '/2.js', '/3.js', '/4.js', '/jquery.min.js');
      importer.merge = {
        "path" : "/merge",
        "except" : [
          "/jquery.min.js",
          "/global.css"
        ],
        "files" : [
          [
            "/1.css",
            "/2.css"
          ],
          [
            "/1.js",
            "/3.js"
          ]
        ]
      };
      let exportCssStr = '<link rel="stylesheet" href="/merge/1,2.css" type="text/css" /><link rel="stylesheet" href="/global.css" type="text/css" />';
      assert.equal(exportCssStr, importer.exportCss());
      let exportJsStr = '<script type="text/javascript" src="/merge/1,3.js"></script><script type="text/javascript" src="/jquery.min.js"></script><script type="text/javascript" src="/merge/2,4.js"></script>';
      assert.equal(exportJsStr, importer.exportJs());
    });
  });


  describe('#versionMode', function(){
    it('should set version mode successful', function(){
      let importer = new Importer();
      importer.import('/abc/1.css', '/2.css');
      importer.versionMode = 1;
      importer.version = {
        '/abc/1.css' : '123',
        '/2.css' : '234'
      };
      let exportCssStr = '<link rel="stylesheet" href="/abc/1.123.css" type="text/css" /><link rel="stylesheet" href="/2.234.css" type="text/css" />';
      assert.equal(exportCssStr, importer.exportCss());
    });
  })
});
