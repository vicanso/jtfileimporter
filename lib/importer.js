"use strict";

var _ = require('underscore');
var url = require('url');
var path = require('path');

var Importer = function(){
  this._options = {};
  this._cssFiles = [];
  this._jsFiles = [];
};

var fn = Importer.prototype;
var propertyList = 'prefix hosts version merge debug srcPath versionMode'.split(' ');

_.each(propertyList, function(property){
  Object.defineProperty(fn, property, {
    set : function(v){
      this._options[property] = v;
    },
    get : function(){
      return _.clone(this._options[property]);
    }
  });
});

/**
 * [import 引入静态文件，参数可以为url或者[url, url]的形式]
 * @return {Importer} [description]
 */
fn.import = function(){
  var files = _.flatten(_.toArray(arguments));
  var self = this;
  _.each(files, function(file){
    var urlInfo = url.parse(file);
    var ext = path.extname(urlInfo.pathname);
    if(ext == '.js'){
      self.importFile(file, 'js');
    }else{
      self.importFile(file, 'css');
    }
  });
  return this;
};

/**
 * [importFile 引入静态文件]
 * @param  {String} file [description]
 * @return {[type]}      [description]
 */
fn.importFile = function(file, type){
  file = file.trim();
  if(!file){
    return this;
  }
  var cssFiles = this._cssFiles;
  var jsFiles = this._jsFiles;
  if(type == 'css'){
    if(!~_.indexOf(cssFiles, file)){
      cssFiles.push(file);
    }
  }else if(!~_.indexOf(jsFiles, file)){
    jsFiles.push(file);
  }
  return this;
};

/**
 * [exportCss 输出css标签]
 * @return {[type]} [description]
 */
fn.exportCss = function(){
  return this.exportFile('css');
};


/**
 * [exportJs 输出js标签]
 * @return {[type]} [description]
 */
fn.exportJs = function(){
  return this.exportFile('js');
};

/**
 * [getFiles 获取文件列表]
 * @param  {[type]} type [description]
 * @return {[type]}      [description]
 */
fn.getFiles = function(type){
  if(type === 'js'){
    return _.clone(this._jsFiles);
  }else{
    return _.clone(this._cssFiles);
  }
};

/**
 * [exportFile description]
 * @param  {[type]} type [description]
 * @return {[type]}      [description]
 */
fn.exportFile = function(type){
  var self = this;
  var files = type === 'js'? self._jsFiles : self._cssFiles;
  var tmpFiles = _.clone(files);
  if(self.merge && !self.debug){
    tmpFiles = self._getMergeFiles(tmpFiles);
  }
  var htmlArr = _.map(tmpFiles, function(file){
    if(self.debug && type == 'js' && self.srcPath && !isRejected(file)){
      file = path.join(self.srcPath, file);
    }
    var fileUrl = self._getUrl(file);
    if(type == 'js'){
      return '<script type="text/javascript" src="' + fileUrl + '"></script>';
    }else{
      return '<link rel="stylesheet" href="' + fileUrl + '" type="text/css" />';
    }
  });
  return htmlArr.join('');
};

/**
 * [isRejected 判断是否外部的静态文件]
 * @param  {[type]}  fileUrl [description]
 * @return {Boolean}         [description]
 */
var isRejected = function(fileUrl){
  return fileUrl.substring(0, 7) === 'http://' || fileUrl.substring(0, 8) === 'https://' || fileUrl.substring(0, 2) === '//';
};

/**
 * [getMergeFileName 获取合并文件名]
 * @param  {[type]} files     [description]
 * @param  {[type]} mergePath [description]
 * @return {[type]}           [description]
 */
var getMergeFileName = function(files, mergePath){
  var ext = path.extname(files[0]);
  var names = _.map(files, function(file){
    return path.basename(file, ext);
  });
  var name = names.join(',') + ext;
  return path.join(mergePath, name);
};

/**
 * [_getMergeFiles 获取合并之后的文件列表]
 * @param  {[type]} files [description]
 * @return {[type]}       [description]
 */
fn._getMergeFiles = function(files){
  var mergeInfo = this.merge;
  var filterFiles = [];
  // 需要合并的文件或者except的
  var mergeResult = [];
  var otherFiles = [];
  filterFiles.push.apply(filterFiles, mergeInfo.files);
  filterFiles.push.apply(filterFiles, mergeInfo.except);
  filterFiles = _.flatten(filterFiles);
  _.each(files, function(file){
    if(~_.indexOf(filterFiles, file)){
      var result = _.find(mergeInfo.files, function(tmpFiles){
        return ~_.indexOf(tmpFiles, file);
      });
      mergeResult.push(result || file);
    }else{
      otherFiles.push(file);
    }
  });
  mergeResult.push(otherFiles)
  var exportFiles = _.map(_.uniq(mergeResult), function(data){
    if(_.isArray(data)){
      if(data.length < 2){
        return data[0];
      }else{
        return getMergeFileName(data, mergeInfo.path);
      }
    }else{
      return data;
    }
  });
  return _.compact(exportFiles);
};



/**
 * [_getUrl 获取文件的引入url]
 * @param  {[type]} file [description]
 * @return {[type]}      [description]
 */
fn._getUrl = function(file){
  var self = this;
  if(isRejected(file)){
    return file;
  }
  var version = this.version;
  var joinVersion = function(file, v){
    var ext = path.extname(file);
    if(self.versionMode == 1){
      return file.substring(0, file.length - ext.length) + '_' + v + ext;
    }else{
      return file + '?v=' + v;
    }
  };
  if(version){
    if(_.isString(version)){
      file = joinVersion(file, version);
    }else if(_.isObject(version)){
      var v = version[file] || version['default'];
      if(v){
        file = joinVersion(file, v);
      }
    }
  }
  var hosts = this.hosts;
  var prefix = this.prefix;
  if(prefix){
    file = path.join(prefix, file);
  }
  if(_.isString(hosts)){
    hosts = [hosts];
  }
  if(hosts && hosts.length){
    var host = hosts[file.length % hosts.length];
    file = '//' + path.join(host, file);
  }
  return file;
};
module.exports = Importer;
