"use strict";
var _ = require('lodash');
var url = require('url');

class Importer {
  constructor(options) {
    options = options || {};
    this._cssFiles = [];
    this._jsFiles = [];

    Object.defineProperty(this, 'prefix', {
      set : function setPrefix(v) {
        options.prefix = v;
      },
      get : function getPrefix() {
        return options.prefix;
      }
    });

    Object.defineProperty(this, 'hosts', {
      set : function setHosts(hosts) {
        if(hosts){
          if(!_.isArray(hosts)){
            hosts = [hosts];
          }
          options.hosts = hosts;
        }else{
          options.hosts = null;
        }
      },
      get : function getHosts() {
        return options.hosts;
      }
    });

    Object.defineProperty(this, 'version', {
      set : function setVersion(version) {
        options.version = version;
      },
      get : function getVersion() {
        return options.version;
      }
    });
  }
  import() {
    let files = _.flattenDeep(_.toArray(arguments));
    let self = this;
    _.forEach(files, function importEach(file) {
      let urlInfo = url.parse(file);
      let ext = extname(urlInfo.pathname);
      if (ext === '.js') {
        self.importFile(file, 'js');
      } else {
        self.importFile(file, 'css');
      }
    });
  }
  importFile(file, type) {
    file = file.trim();
    if (!file) {
      return this;
    }
    let cssFile = this._cssFiles;
    let jsFiles = this._jsFiles;

    if (type === 'css') {
      if(!~_.indexOf(cssFiles, file)){
        cssFiles.push(file);
      }
    } else if (!~_.indexOf(jsFiles, file)) {
      jsFiles.push(file);
    }
    return this;
  }
}

function extname(file) {
  if (!file) {
    return '';
  }
  let arr = file.split('.');
  if (arr.length === 1) {
    return '';
  } else {
    return '.' + _.last(arr);
  }
}


var test = new Importer();
test.import('a.js');

console.dir(test)
module.exports = Importer;
