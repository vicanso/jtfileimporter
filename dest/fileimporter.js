(function() {
  var FileImporter, path, _;

  _ = require('underscore');

  path = require('path');

  FileImporter = (function() {
    function FileImporter(_merger) {
      this._merger = _merger;
      this._cssFiles = [];
      this._jsFiles = [];
    }


    /**
     * [prefix 设置url前缀]
     * @param  {[type]} prefix [description]
     * @return {[type]}        [description]
     */

    FileImporter.prototype.prefix = function(prefix) {
      if (arguments.length === 0) {
        return this._prefix;
      } else {
        this._prefix = prefix;
        return this;
      }
    };


    /**
     * [hosts description]
     * @param  {String, Array} hosts [description]
     * @return {[type]}       [description]
     */

    FileImporter.prototype.hosts = function(hosts) {
      if (arguments.length === 0) {
        return _.clone(this._hosts);
      } else {
        if (_.isString(hosts)) {
          hosts = [hosts];
        }
        this._hosts = hosts;
        return this;
      }
    };


    /**
     * [version description]
     * @param {String, Object} @_version [description]
     */

    FileImporter.prototype.version = function(version) {
      if (arguments.length === 0) {
        if (_.isString(this._versionConfig)) {
          return this._versionConfig;
        } else {
          return _.clone(this._versionConfig);
        }
      } else {
        this._versionConfig = version;
        return this;
      }
    };


    /**
     * [getFiles description]
     * @param  {String} type [description]
     * @return {[type]}      [description]
     */

    FileImporter.prototype.getFiles = function(type) {
      var files;
      if (type === 'js') {
        files = this._jsFiles;
      } else {
        files = this._cssFiles;
      }
      return _.uniq(files);
    };


    /**
     * [import 引入文件]
     * @param  {String, Array} file [description]
     * @return {[type]}      [description]
     */

    FileImporter.prototype["import"] = function(file) {
      var ext, url, urlInfo;
      url = require('url');
      if (_.isArray(file)) {
        return _.each(file, (function(_this) {
          return function(tmp) {
            return _this["import"](tmp);
          };
        })(this));
      } else {
        urlInfo = url.parse(file);
        ext = path.extname(urlInfo.pathname);
        if (ext === '.js') {
          return this.importJs(file);
        } else {
          return this.importCss(file);
        }
      }
    };


    /**
     * [importCss description]
     * @param  {String, Array} file [description]
     * @return {[type]}      [description]
     */

    FileImporter.prototype.importCss = function(file) {
      return this.importFile(file, 'css');
    };


    /**
     * [importJs description]
     * @param  {String, Array} file [description]
     * @return {[type]}      [description]
     */

    FileImporter.prototype.importJs = function(file) {
      return this.importFile(file, 'js');
    };


    /**
     * [importFile description]
     * @param  {String, Array} file [description]
     * @param  {String} type [description]
     * @return {[type]}      [description]
     */

    FileImporter.prototype.importFile = function(file, type) {
      if (_.isArray(file)) {
        _.each(file, (function(_this) {
          return function(tmpFile) {
            return _this.importFile(tmpFile, type);
          };
        })(this));
      } else if (_.isString(file)) {
        file = file.trim();
        if (file) {
          if (type === 'css') {
            this._cssFiles.push(file);
          } else {
            this._jsFiles.push(file);
          }
        }
      }
      return this;
    };


    /**
     * [exportCss description]
     * @return {[type]}       [description]
     */

    FileImporter.prototype.exportCss = function() {
      return this.exportFile('css');
    };


    /**
     * [exportJs description]
     * @return {[type]}       [description]
     */

    FileImporter.prototype.exportJs = function() {
      return this.exportFile('js');
    };


    /**
     * [exportFile description]
     * @param  {String} type  [description]
     * @return {[type]}       [description]
     */

    FileImporter.prototype.exportFile = function(type) {
      return this._getExportFileHTML(type);
    };


    /**
     * [debug description]
     * @param  {[type]} @_debug [description]
     * @return {[type]}         [description]
     */

    FileImporter.prototype.debug = function(_debug) {
      this._debug = _debug;
    };


    /**
     * _isFilter 判断该文件是否应该过滤的
     * @param  {String}  file [description]
     * @return {Boolean}      [description]
     */

    FileImporter.prototype._isFilter = function(file) {
      return file.substring(0, 7) === 'http://' || file.substring(0, 8) === 'https://';
    };


    /**
     * [_getExportFileHTML description]
     * @param  {String} type  [description]
     * @return {[type]}       [description]
     */

    FileImporter.prototype._getExportFileHTML = function(type) {
      var files, hosts, htmlArr, tmpFiles;
      files = type === 'js' ? this._jsFiles : this._cssFiles;
      files = _.uniq(files);
      hosts = this._hosts;
      tmpFiles = _.clone(files);
      if (this._debug) {
        tmpFiles = _.map(tmpFiles, function(file) {
          if (path.extname(file) === '.js') {
            return path.join('/src', file);
          } else {
            return file;
          }
        });
      } else {
        if (this._merger) {
          tmpFiles = this._merger.getMergeExportFiles(tmpFiles);
        }
      }
      htmlArr = _.map(tmpFiles, (function(_this) {
        return function(file) {
          return _this._getExportHTML(file, type);
        };
      })(this));
      return htmlArr.join('');
    };


    /**
     * [_getExportHTML description]
     * @param  {String} file [description]
     * @param  {String} type [description]
     * @return {[type]}      [description]
     */

    FileImporter.prototype._getExportHTML = function(file, type) {
      var html;
      html = '';
      switch (type) {
        case 'js':
          html = this._getExportJsHTML(file);
          break;
        default:
          html = this._getExportCssHTML(file);
      }
      return html;
    };


    /**
     * [_getExportJsHTML description]
     * @param  {String} file [description]
     * @return {[type]}      [description]
     */

    FileImporter.prototype._getExportJsHTML = function(file) {
      var url;
      url = this._getUrl(file);
      return '<script type="text/javascript" src="' + url + '"></script>';
    };


    /**
     * [_getExportCssHTML description]
     * @param  {String} file [description]
     * @return {[type]}      [description]
     */

    FileImporter.prototype._getExportCssHTML = function(file) {
      var url;
      url = this._getUrl(file);
      return '<link rel="stylesheet" href="' + url + '" type="text/css" />';
    };


    /**
     * [_getUrl description]
     * @param  {String} file [description]
     * @return {[type]}      [description]
     */

    FileImporter.prototype._getUrl = function(file) {
      var host, hosts, version, versionConfig;
      if (this._isFilter(file)) {
        return file;
      }
      versionConfig = this._versionConfig;
      if (versionConfig) {
        if (_.isString(versionConfig)) {
          file += "?v=" + versionConfig;
        } else if (_.isObject(versionConfig)) {
          version = versionConfig[file] || versionConfig['default'];
          if (version) {
            file += "?v=" + version;
          }
        }
      }
      hosts = this._hosts;
      if (this._prefix) {
        file = path.join(this._prefix, file);
      }
      if (hosts) {
        host = hosts[file.length % hosts.length];
        if (host) {
          if ('http' !== host.substring(0, 4)) {
            host = "http://" + host;
          }
          file = path.join(host, file);
        }
      }
      return file;
    };

    return FileImporter;

  })();

  module.exports = FileImporter;

}).call(this);
