"use strict";
var assert = require('assert');
var Importer = require('../lib/importer');

describe('Importer', function(){
  describe('#hosts', function(){
    it('should set hosts successful', function(){
      var importer = new Importer();
      var hosts = 'vicanso.com';
      importer.hosts = hosts;
      assert.equal(hosts, importer.hosts);

      hosts = ['vicanso.com', 'jenny.com'];
      importer.hosts = hosts;
      assert.equal(hosts.join(''), importer.hosts.join(''));
    });
  });

  describe('#prefix', function(){
    it('should set prefix successful', function(){
      var importer = new Importer();
      var prefix = '/static';
      importer.prefix = prefix;
      assert.equal(prefix, importer.prefix);

      var cssFiles = ['1.css', 'http://baidu.com/1.css'];
      importer.import(cssFiles);
      assert.equal('<link rel="stylesheet" href="/static/1.css" type="text/css" /><link rel="stylesheet" href="http://baidu.com/1.css" type="text/css" />', importer.exportCss());
    });
  });

  describe('#version', function(){
    it('should set version successful', function(){
      var importer = new Importer();
      var version = '12345';
      importer.version = version;
      assert.equal(version, importer.version);
    });
  });


  describe('#import,  #exportCss, #exportJs', function(){
    it('should import file successful', function(){
      var importer = new Importer();
      var files = ['1.js', '2.js'];
      importer.import(files);
      var exportJsStr = '<script type="text/javascript" src="1.js"></script><script type="text/javascript" src="2.js"></script>';
      assert.equal(exportJsStr, importer.exportJs());


      importer.version = '123';
      exportJsStr = '<script type="text/javascript" src="1.js?v=123"></script><script type="text/javascript" src="2.js?v=123"></script>';
      assert.equal(exportJsStr, importer.exportJs());


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
        '2.css' : '234'
      };
      exportCssStr = '<link rel="stylesheet" href="1.css?v=123" type="text/css" /><link rel="stylesheet" href="2.css?v=234" type="text/css" />';
      assert.equal(exportCssStr, importer.exportCss());

    });
  });


  describe('#merge', function(){
    it('should set merge info successful', function(){
      var importer = new Importer();
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
      var exportCssStr = '<link rel="stylesheet" href="/merge/1,2.css" type="text/css" /><link rel="stylesheet" href="/global.css" type="text/css" />';
      assert.equal(exportCssStr, importer.exportCss());
      var exportJsStr = '<script type="text/javascript" src="/merge/1,3.js"></script><script type="text/javascript" src="/jquery.min.js"></script><script type="text/javascript" src="/merge/2,4.js"></script>';
      assert.equal(exportJsStr, importer.exportJs());
    });
  });


  describe('#debug', function(){
    it('should set debug mode successful', function(){
      var importer = new Importer();
      importer.import('/1.js', '/2.js', '/3.js', '/4.js', '//jquery.com/jquery.min.js');
      importer.debug = true;
      importer.srcPath = '/src';
      var exportJsStr = '<script type="text/javascript" src="/src/1.js"></script><script type="text/javascript" src="/src/2.js"></script><script type="text/javascript" src="/src/3.js"></script><script type="text/javascript" src="/src/4.js"></script><script type="text/javascript" src="//jquery.com/jquery.min.js"></script>';
      assert.equal(exportJsStr, importer.exportJs());
    });
  });

  describe('#versionMode', function(){
    it('should set version mode successful', function(){
      var importer = new Importer();
      importer.import('/abc/1.css', '/2.css');
      importer.versionMode = 1;
      importer.version = {
        '/abc/1.css' : '123',
        '/2.css' : '234'
      };
      var exportCssStr = '<link rel="stylesheet" href="/abc/1_123.css" type="text/css" /><link rel="stylesheet" href="/2_234.css" type="text/css" />';
      assert.equal(exportCssStr, importer.exportCss());
    });
  })
});