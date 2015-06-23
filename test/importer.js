"use strict";
var assert = require('assert');
var Importer = require('../lib/importer');

describe('Importer', function(){
  describe('#prefix', function(){
    it('should set prefix successful', function(){
      var importer = new Importer();
      var prefix = '/static';
      importer.prefix = prefix;
      assert.equal(prefix, importer.prefix);

    });
  });
});