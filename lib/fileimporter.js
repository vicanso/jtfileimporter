/**!
* Copyright(c) 2013 vicanso 腻味
* MIT Licensed
*/


(function() {
  var FileImporter, fs, isProductionMode, path, _;

  _ = require('underscore');

  fs = require('fs');

  path = require('path');

  isProductionMode = process.env.NODE_ENV === 'production';

  FileImporter = (function() {
    /**
     * constructor 文件引入类
     * @return {FileImporter}       [description]
    */

    function FileImporter(options) {
      this.options = options != null ? options : {};
      this.cssFiles = [];
      this.jsFiles = [];
    }

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
          file = _this._convertExt(file);
          return resultFiles.push.apply(resultFiles, _this._getDependencies(file));
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

    FileImporter.prototype._getDependencies = function(file) {
      var data, readFile, requireFiles, requireReg, result, staticPath,
        _this = this;
      staticPath = this.options.path;
      if (staticPath) {
        readFile = path.join(staticPath, file);
      } else {
        readFile = file;
      }
      data = fs.readFileSync(readFile, 'utf8');
      requireReg = /"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|\/\*[\S\s]*?\*\/|\/(?:\\\/|[^\/\r\n])+\/(?=[^\/])|\/\/.*|\.\s*require|(?:^|[^$])\brequire\s*\(\s*(["'])(.+?)\1\s*\)/g;
      requireFiles = data.match(requireReg);
      result = [];
      _.each(requireFiles, function(tmpFile) {
        if (tmpFile[0] === '\'' || tmpFile[0] === '"') {
          tmpFile = tmpFile.substring(1, tmpFile.length - 1);
        }
        if (fs.existsSync(path.join(staticPath, "" + tmpFile + ".coffee"))) {
          tmpFile = "" + tmpFile + ".coffee";
        } else {
          tmpFile = "" + tmpFile + ".js";
        }
        if (!~_.indexOf(result, tmpFile)) {
          return result.push.apply(result, _this._getDependencies(tmpFile));
        }
      });
      result.push(file);
      return _.uniq(_.flatten(result));
    };

    return FileImporter;

  })();

  module.exports = FileImporter;

}).call(this);
