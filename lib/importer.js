"use strict";
const _ = require('lodash');
const url = require('url');
const path = require('path');
const debug = require('debug')('jt.fileimporter');

class Importer {
  /**
   * [constructor description]
   * @param  {[type]} options [description]
   * @return {[type]}         [description]
   */
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

  /**
   * [import 引入文件，参数支持String, Arrray和多参数的形式]
   * @return {[type]} [description]
   */
  import() {
    let files = _.flattenDeep(_.toArray(arguments));
    let self = this;
    _.forEach(files, function importEach(file) {
      let urlInfo = url.parse(file);
      let ext = extname(urlInfo.pathname);
      if (ext === '.js') {
        self._importFile(file, 'js');
      } else {
        self._importFile(file, 'css');
      }
    });
  }

  /**
   * [exportCss 输出css标签列表]
   * @return {[type]} [description]
   */
  exportCss() {
    return this._exportFile('css');
  }

  /**
   * [exportJs 输出js标签列表]
   * @return {[type]} [description]
   */
  exportJs() {
    return this._exportFile('js');
  }

  /**
   * [getFiles 获取文件列表]
   * @param  {[type]} type [description]
   * @return {[type]}      [description]
   */
  getFiles(type) {
    if (type === 'js') {
      return _.clone(this._jsFiles);
    } else {
      return _.clone(this._cssFiles);
    }
  }

  /**
   * [_exportFile 输出对应类型的html]
   * @param  {[type]} type [description]
   * @return {[type]}      [description]
   */
  _exportFile(type) {
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

  /**
   * [_importFile 引入文件]
   * @param  {[type]} file [description]
   * @param  {[type]} type [description]
   * @return {[type]}      [description]
   */
  _importFile(file, type) {
    let self = this;
    file = file.trim();
    if (!file) {
      return self;
    }
    let cssFiles = self._cssFiles;
    let jsFiles = self._jsFiles;
    debug('import type:%s, file:%s', type, file);
    if (type === 'css') {
      if(!~_.indexOf(cssFiles, file)){
        cssFiles.push(file);
      }
    } else if (!~_.indexOf(jsFiles, file)) {
      jsFiles.push(file);
    }
    return self;
  }

  /**
   * [_getUrl 获取url]
   * @param  {[type]} file [description]
   * @return {[type]}      [description]
   */
  _getUrl(file) {
    if (isRejected(file)) {
      return file;
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

  /**
   * [_joinVersion 为文件添加版本号]
   * @param  {[type]} file [description]
   * @param  {[type]} v    [description]
   * @return {[type]}      [description]
   */
  _joinVersion(file, v) {
    let self = this;
    let ext = extname(file);
    if (self.versionMode == 1){
      return file.substring(0, file.length - ext.length) + '.' + v + ext;
    } else {
      return file + '?v=' + v;
    }
  }

  /**
   * [_getMergeFiles 获取合并文件]
   * @param  {[type]} files [description]
   * @return {[type]}       [description]
   */
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

/**
 * [extname 获取文件后缀]
 * @param  {[type]} file [description]
 * @return {[type]}      [description]
 */
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

/**
 * [isRejected description]
 * @param  {[type]}  fileUrl [description]
 * @return {Boolean}         [description]
 */
function isRejected(fileUrl){
  return fileUrl.substring(0, 7) === 'http://' || fileUrl.substring(0, 8) === 'https://' || fileUrl.substring(0, 2) === '//';
}

/**
 * [getMergeFileName 获取文件合并名]
 * @param  {[type]} files     [description]
 * @param  {[type]} mergePath [description]
 * @return {[type]}           [description]
 */
function getMergeFileName(files, mergePath){
  let ext = extname(files[0]);
  let names = _.map(files, function(file){
    return path.basename(file, ext);
  });
  let name = names.join(',') + ext;
  return path.join(mergePath, name);
}

module.exports = Importer;
