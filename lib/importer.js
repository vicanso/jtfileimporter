"use strict";
const _ = require('lodash');
const url = require('url');
const path = require('path');
const privateKey = Date.now();

class Importer {
  constructor(options) {
    let self = this;
    options = options || {};
    self._cssFiles = [];
    self._jsFiles = [];

    Object.defineProperty(self, 'prefix', {
      set : function setPrefix(v) {
        options.prefix = v;
        return self;
      },
      get : function getPrefix() {
        return options.prefix;
      }
    });

    Object.defineProperty(self, 'hosts', {
      set : function setHosts(hosts) {
        if(hosts){
          if(!_.isArray(hosts)){
            hosts = [hosts];
          }
          options.hosts = hosts;
        }else{
          options.hosts = null;
        }
        return self;
      },
      get : function getHosts() {
        return options.hosts;
      }
    });

    Object.defineProperty(self, 'version', {
      set : function setVersion(version) {
        options.version = version;
        return self;
      },
      get : function getVersion() {
        return options.version;
      }
    });

    Object.defineProperty(self, 'versionMode', {
      set : function setVersionMode(mode) {
        options.versionMode = mode;
        return self;
      },
      get : function getVersionMode() {
        return options.versionMode;
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
    let self = this;
    file = file.trim();
    if (!file) {
      return self;
    }
    let cssFiles = self._cssFiles;
    let jsFiles = self._jsFiles;

    if (type === 'css') {
      if(!~_.indexOf(cssFiles, file)){
        cssFiles.push(file);
      }
    } else if (!~_.indexOf(jsFiles, file)) {
      jsFiles.push(file);
    }
    return self;
  }


  exportCss() {
    return this.exportFile('css');
  }

  exportJs() {
    return this.exportFile('js');
  }

  getFiles(type) {
    if (type === 'js') {
      return _.clone(this._jsFiles);
    } else {
      return _.clone(this._cssFiles);
    }
  }

  exportFile(type) {
    let self = this;
    let files = type === 'js'? self._jsFiles : self._cssFiles;
    let tmpFiles = _.clone(files);
    if (self.merge) {
      tmpFiles = self._getMergeFiles(tmpFiles);
    }
    let htmlArr = _.map(tmpFiles, function(file) {
      let fileUrl = self._getUrl(file);
      if (type === 'js') {
        return '<script type="text/javascript" src="' + fileUrl + '"></script>'; 
      } else {
        return '<link rel="stylesheet" href="' + fileUrl + '" type="text/css" />';
      }
    });
    return htmlArr.join('');
  }


  _getUrl(file) {
    if (isRejected(file)) {
      return '';
    }
    let self = this;
    let version = self.version;
    if (version) {
      if (_.isString(version)) {
        file = self._joinVersion(file, version);
      } else if (_.isObject(version)) {
        let v = version[file] || version['default'];
        if (v) {
          file = self._joinVersion(file, v);
        }
      }
    }
    let hosts = self.hosts;
    let prefix = self.prefix;
    if (prefix) {
      file = path.join(prefix, file);
    }

    if(hosts && hosts.length){
      let host = hosts[file.length % hosts.length];
      file = '//' + path.join(host, file);
    }
    return file.replace(/\\/g, '/');
  }

  _joinVersion(file, v) {
    let self = this;
    let ext = extname(file);
    if (self.versionMode == 1){
      return file.substring(0, file.length - ext.length) + '.' + v + ext;
    } else {
      return file + '?v=' + v;
    }
  }

  _getMergeFiles(files) {
    let mergeInfo = this.merge;
    let filterFiles = [];
    let mergeResult = [];
    let otherFiles = [];
    filterFiles.push.apply(filterFiles, mergeInfo.files);
    filterFiles.push.apply(filterFiles, mergeInfo.except);
    filterFiles = _.flatten(filterFiles);
    _.forEach(files, function mergeEach(file) {
      if (~_.indexOf(filterFiles, file)) {
        let result = _.find(mergeInfo.files, function find(arr) {
          return ~_.indexOf(arr, file);
        });
        mergeResult.push(result || file);
      } else {
        otherFiles.push(file);
      }
    });
    mergeResult.push(otherFiles);
    let exportFiles = _.map(_.uniq(mergeResult), function getFileName(data) {
      if (_.isArray(data)) {
        if (data.length < 2) {
          return data[0];
        } else {
          return getMergeFileName(data, mergeInfo.path);
        }
      } else {
        return data;
      }
    });
    return _.compact(exportFiles);
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

function isRejected(fileUrl){
  return fileUrl.substring(0, 7) === 'http://' || fileUrl.substring(0, 8) === 'https://' || fileUrl.substring(0, 2) === '//';
}

function checkPrivate(key){
  if(key !== privateKey){
    throw new Error('the function is private');
  }
}


function getMergeFileName(files, mergePath){
  var ext = extname(files[0]);
  var names = _.map(files, function(file){
    return path.basename(file, ext);
  });
  var name = names.join(',') + ext;
  return path.join(mergePath, name);
}

// var test = new Importer();
// test.import('a.js');

// console.dir(test)
module.exports = Importer;
