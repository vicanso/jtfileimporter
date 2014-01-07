
/**!
* Copyright(c) 2013 vicanso 腻味
* MIT Licensed
*/


(function() {
  var FileImporter, events, fs, isProductionMode, jtModule, path, _,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('underscore');

  fs = require('fs');

  path = require('path');

  events = require('events');

  isProductionMode = process.env.NODE_ENV === 'production';

  jtModule = require('jtmodule');

  FileImporter = (function(_super) {

    __extends(FileImporter, _super);

    /**
     * constructor 文件引入类
     * @return {FileImporter}       [description]
    */


    function FileImporter(options) {
      var _ref;
      this.options = options != null ? options : {};
      this.cssFiles = [];
      this.jsFiles = [];
      if ((_ref = this.hosts) == null) {
        this.hosts = this.options.hosts;
      }
      if (this.hosts) {
        if (!_.isArray(this.hosts)) {
          this.hosts = [this.hosts];
        }
        this.hosts = _.map(this.hosts, function(host) {
          if ('http' !== host.substring(0, 4)) {
            return host = "http://" + host;
          } else {
            return host;
          }
        });
      }
    }

    /**
     * getFiles 获取文件列表
     * @param  {[type]} type [description]
     * @return {[type]}      [description]
    */


    FileImporter.prototype.getFiles = function(type) {
      if (type === 'css') {
        return this._cssFiles;
      } else {
        return this._jsFiles;
      }
    };

    /**
     * importCss 引入css文件
     * @param  {String} file     css路径
     * @return {FileImporter}         [description]
    */


    FileImporter.prototype.importCss = function(file) {
      this.importFiles(file, 'css');
      return this;
    };

    /**
     * importJs 引入js文件
     * @param  {String} file    js路径
     * @return {FileImporter}         [description]
    */


    FileImporter.prototype.importJs = function(file) {
      this.importFiles(file, 'js');
      return this;
    };

    /**
     * importFiles 引入文件
     * @param  {String} file    文件路径
     * @param  {String} type    文件类型(css, js)
     * @return {FileImporter}         [description]
    */


    FileImporter.prototype.importFiles = function(file, type) {
      var cssFiles, jsFiles,
        _this = this;
      cssFiles = this.cssFiles;
      jsFiles = this.jsFiles;
      if (_.isString(file)) {
        file = file.trim();
        if (file.charAt(0) !== '/' && !this._isFilter(file)) {
          file = '/' + file;
        }
        if (type === 'css') {
          if (!~_.indexOf(cssFiles, file)) {
            cssFiles.push(file);
          }
        } else if (!~_.indexOf(jsFiles, file)) {
          jsFiles.push(file);
        }
      } else if (_.isArray(file)) {
        _.each(file, function(item) {
          return _this.importFiles(item, type);
        });
      }
      return this;
    };

    /**
     * exportCss 输出CSS标签
     * @param  {Boolean} merge 是否合并css文件
     * @return {String} 返回css标签
    */


    FileImporter.prototype.exportCss = function(merge) {
      return this._getExportFilesHTML('css', merge);
    };

    /**
     * exportJs 输出JS标签
     * @param  {Boolean} merge 是否合并js文件
     * @return {String} 返回js标签
    */


    FileImporter.prototype.exportJs = function(merge) {
      return this._getExportFilesHTML('js', merge);
    };

    /**
     * _getExportFilesHTML 获取引入文件列表对应的HTML
     * @param  {Boolean} merge 是否需要合并文件
     * @return {String} 返回html标签内容
    */


    FileImporter.prototype._getExportFilesHTML = function(type, merge) {
      var files, hosts, htmlArr, resultFiles,
        _this = this;
      if (type === 'css') {
        files = this.cssFiles;
      } else {
        files = this.jsFiles;
      }
      hosts = this.hosts;
      resultFiles = [];
      _.each(files, function(file) {
        if (!_this._isFilter(file)) {
          if (type === 'js') {
            return resultFiles.push.apply(resultFiles, jtModule.getDependencies(_this.options.path, file));
          } else {
            return resultFiles.push(file);
          }
        } else {
          return resultFiles.push(file);
        }
      });
      resultFiles = _.compact(resultFiles);
      resultFiles = _.uniq(resultFiles, function(item) {
        if (_.isArray(item)) {
          return item.join(',');
        } else {
          return item;
        }
      });
      if (type === 'css') {
        this._cssFiles = resultFiles;
      } else {
        this._jsFiles = resultFiles;
      }
      htmlArr = _.map(resultFiles, function(file) {
        return _this._getExportHTML(file, type);
      });
      return htmlArr.join('');
    };

    /**
     * _isFilter 判断该文件是否应该过滤的
     * @param  {String}  file 引入文件路径
     * @return {Boolean}      [description]
    */


    FileImporter.prototype._isFilter = function(file) {
      if (file.substring(0, 7) === 'http://' || file.substring(0, 8) === 'https://') {
        return true;
      } else {
        return false;
      }
    };

    /**
     * _getExportHTML 返回生成的HTML
     * @param  {String} file   引入的文件
     * @param  {String} type   文件类型
     * @return {String} 返回相应的html
    */


    FileImporter.prototype._getExportHTML = function(file, type) {
      var html;
      html = '';
      switch (type) {
        case 'js':
          html = this._exportJsHTML(file);
          break;
        default:
          html = this._exportCssHTML(file);
      }
      return html;
    };

    /**
     * _exportJsHTML 返回引入JS的标签HTML
     * @param  {String} file   引入的文件
     * @return {String} 返回相应的html
    */


    FileImporter.prototype._exportJsHTML = function(file) {
      var url;
      url = this._getUrl(file);
      return '<script type="text/javascript" src="' + url + '"></script>';
    };

    /**
     * _exportCssHTML 返回引入CSS标签的HTML
     * @param  {String} file   引入的文件
     * @return {String} 返回相应的html
    */


    FileImporter.prototype._exportCssHTML = function(file) {
      var url;
      url = this._getUrl(file);
      return '<link rel="stylesheet" href="' + url + '" type="text/css" />';
    };

    /**
     * _getUrl 获取引用文件的URL
     * @param  {String} file 文件路径
     * @return {[type]}      [description]
    */


    FileImporter.prototype._getUrl = function(file) {
      var host, hosts, index, urlPrefix, version;
      hosts = this.hosts;
      version = this.options.version;
      urlPrefix = this.options.urlPrefix;
      if (urlPrefix && urlPrefix.charAt(0) !== '/') {
        urlPrefix = '/' + urlPrefix;
      }
      if (!this._isFilter(file)) {
        if (version) {
          file += "?version=" + version;
        }
        if (file.charAt(0) !== '/') {
          file = '/' + file;
        }
        if (urlPrefix) {
          file = "" + urlPrefix + file;
        }
        if (hosts) {
          index = file.length % hosts.length;
          host = hosts[index];
          if (host) {
            file = host + file;
          }
        }
      }
      return file;
    };

    /**
     * _convertExt 转换文件后缀
     * @param  {[type]} file [description]
     * @return {[type]}      [description]
    */


    FileImporter.prototype._convertExt = function(file) {
      var convertExts, dstExt, srcExt;
      convertExts = this.options.convertExts;
      if ((convertExts != null ? convertExts.src : void 0) && convertExts.dst) {
        dstExt = '';
        srcExt = _.find(convertExts.src, function(ext, i) {
          if (ext === file.substring(file.length - ext.length)) {
            dstExt = convertExts.dst[i];
            return true;
          } else {
            return false;
          }
        });
        if (srcExt && dstExt) {
          file = file.substring(0, file.length - srcExt.length) + dstExt;
        }
      }
      return file;
    };

    return FileImporter;

  })(events.EventEmitter);

  module.exports = FileImporter;

}).call(this);
