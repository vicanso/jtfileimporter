_ = require 'underscore'
path = require 'path'


class FileImporter
  constructor : (@_merger) ->
    @_cssFiles = []
    @_jsFiles = []
  ###*
   * [prefix 设置url前缀]
   * @param  {[type]} prefix [description]
   * @return {[type]}        [description]
  ###
  prefix : (prefix) ->
    if arguments.length == 0
      @_prefix
    else
      @_prefix = prefix
      @
  ###*
   * [hosts description]
   * @param  {String, Array} hosts [description]
   * @return {[type]}       [description]
  ###
  hosts : (hosts) ->
    if arguments.length == 0
      _.clone @_hosts
    else
      hosts = [hosts] if _.isString hosts
      @_hosts = hosts
      @
  ###*
   * [version description]
   * @param {String, Object} @_version [description]
  ###
  version : (version) ->
    if arguments.length == 0
      if _.isString @_versionConfig
        @_versionConfig
      else
        _.clone @_versionConfig
    else
      @_versionConfig = version
      @

  ###*
   * [getFiles description]
   * @param  {String} type [description]
   * @return {[type]}      [description]
  ###
  getFiles : (type) ->
    if type == 'js'
      files = @_jsFiles
    else
      files = @_cssFiles
    _.uniq files

  ###*
   * [import 引入文件]
   * @param  {String, Array} file [description]
   * @return {[type]}      [description]
  ###
  import : (file) ->
    url = require 'url'
    if _.isArray file
      _.each file, (tmp) =>
        @import tmp
    else
      urlInfo = url.parse file
      ext = path.extname urlInfo.pathname
      if ext == '.js'
        @importJs file
      else
        @importCss file

  ###*
   * [importCss description]
   * @param  {String, Array} file [description]
   * @return {[type]}      [description]
  ###
  importCss : (file) ->
    @importFile file, 'css'

  ###*
   * [importJs description]
   * @param  {String, Array} file [description]
   * @return {[type]}      [description]
  ###
  importJs : (file) ->
    @importFile file, 'js'

  ###*
   * [importFile description]
   * @param  {String, Array} file [description]
   * @param  {String} type [description]
   * @return {[type]}      [description]
  ###
  importFile : (file, type) ->
    if _.isArray file
      _.each file, (tmpFile) =>
        @importFile tmpFile, type
    else if _.isString file
      file = file.trim()
      if file
        if type == 'css'
          @_cssFiles.push file
        else
          @_jsFiles.push file
    @

  ###*
   * [exportCss description]
   * @return {[type]}       [description]
  ###
  exportCss : ->
    @exportFile 'css'


  ###*
   * [exportJs description]
   * @return {[type]}       [description]
  ###
  exportJs : ->
    @exportFile 'js'

  ###*
   * [exportFile description]
   * @param  {String} type  [description]
   * @return {[type]}       [description]
  ###
  exportFile : (type) ->
    @_getExportFileHTML type
  
  ###*
   * [debug description]
   * @param  {[type]} @_debug [description]
   * @return {[type]}         [description]
  ###
  debug : (@_debug)->


  ###*
   * _isFilter 判断该文件是否应该过滤的
   * @param  {String}  file [description]
   * @return {Boolean}      [description]
  ###
  _isFilter : (file) ->
    file.substring(0, 7) == 'http://' || file.substring(0, 8) == 'https://'


  ###*
   * [_getExportFileHTML description]
   * @param  {String} type  [description]
   * @return {[type]}       [description]
  ###
  _getExportFileHTML : (type) ->
    files = if type == 'js' then @_jsFiles else @_cssFiles
    files = _.uniq files

    hosts = @_hosts

    # TODO merge
    tmpFiles = _.clone files
    if @_debug
      tmpFiles = _.map tmpFiles, (file) ->
        path.join '/src', file
    else
      tmpFiles = @_merger.getMergeExportFiles tmpFiles if @_merger
    htmlArr = _.map tmpFiles, (file) =>
      @_getExportHTML file, type
    htmlArr.join ''

  ###*
   * [_getExportHTML description]
   * @param  {String} file [description]
   * @param  {String} type [description]
   * @return {[type]}      [description]
  ###
  _getExportHTML : (file, type) ->
    html = ''
    switch type
      when 'js' then html = @_getExportJsHTML file
      else html = @_getExportCssHTML file
    html

  ###*
   * [_getExportJsHTML description]
   * @param  {String} file [description]
   * @return {[type]}      [description]
  ###
  _getExportJsHTML : (file) ->
    url = @_getUrl file
    '<script type="text/javascript" src="' + url + '"></script>'

  ###*
   * [_getExportCssHTML description]
   * @param  {String} file [description]
   * @return {[type]}      [description]
  ###
  _getExportCssHTML : (file) ->
    url = @_getUrl file
    '<link rel="stylesheet" href="' + url + '" type="text/css" />'

  ###*
   * [_getUrl description]
   * @param  {String} file [description]
   * @return {[type]}      [description]
  ###
  _getUrl : (file) ->
    if @_isFilter file
      return file
    versionConfig = @_versionConfig
    if versionConfig
      if _.isString versionConfig
        file += "?v=#{versionConfig}"
      else if _.isObject versionConfig
        version = versionConfig[file] || versionConfig['default']
        file += "?v=#{version}" if version
    hosts = @_hosts
    file = path.join @_prefix, file if @_prefix
    if hosts
      host = hosts[file.length % hosts.length]
      if host
        host = "http://#{host}" if 'http' != host.substring 0, 4
        file = path.join host,  file 
    file

module.exports = FileImporter