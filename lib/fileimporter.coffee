###*!
* Copyright(c) 2013 vicanso 腻味
* MIT Licensed
###

_ = require 'underscore'
fs = require 'fs'
path = require 'path'
events = require 'events'
JTMerge = require 'jtmerge'


class FileImporter extends events.EventEmitter
  ###*
   * constructor 文件引入类
   * @return {FileImporter}       [description]
  ###
  constructor : (@options = {}) ->
    @cssFiles = []
    @jsFiles = []
    @hosts ?= @options.hosts
    if @options.merge
      @jtMerge = new JTMerge @options.merge
    if @hosts
      if !_.isArray @hosts
        @hosts = [@hosts]
      @hosts = _.map @hosts, (host) ->
        if 'http' != host.substring 0, 4
          host = "http://#{host}"
        else
          host
  ###*
   * getFiles 获取文件列表
   * @param  {[type]} type [description]
   * @return {[type]}      [description]
  ###
  getFiles : (type) ->
    if type == 'css'
      files = @_cssFiles
    else
      files = @_jsFiles
    _.uniq files
  ###*
   * importCss 引入css文件
   * @param  {String} file     css路径
   * @param {Boolean} prepend  是否往往前插入
   * @return {FileImporter}         [description]
  ###
  importCss : (file, prepend) ->
    @importFiles file, 'css', prepend
    @
  ###*
   * importJs 引入js文件
   * @param  {String} file    js路径
   * @param {Boolean} prepend  是否往往前插入
   * @return {FileImporter}         [description]
  ###
  importJs : (file, prepend) ->
    @importFiles file, 'js', prepend
    @
  ###*
   * importFiles 引入文件
   * @param  {String} file    文件路径
   * @param  {String} type    文件类型(css, js)
   * @param {Boolean} prepend  是否往往前插入
   * @return {FileImporter}         [description]
  ###
  importFiles : (file, type, prepend) ->
    cssFiles = @cssFiles
    jsFiles = @jsFiles
    if _.isString file
      file = file.trim()
      if file.charAt(0) != '/' && !@_isFilter file
        file = '/' + file
      if type == 'css'
          if prepend
            cssFiles.unshift file
          else
            cssFiles.push file
      else
        if prepend
          jsFiles.unshift file
        else
          jsFiles.push file
    else if _.isArray file
      _.each file, (item) =>
        @importFiles item, type, prepend
    @
  ###*
   * exportCss 输出CSS标签
   * @param  {Boolean} merge 是否合并css文件
   * @return {String} 返回css标签
  ###
  exportCss : (merge) ->
    @_getExportFilesHTML 'css', merge
  ###*
   * exportJs 输出JS标签
   * @param  {Boolean} merge 是否合并js文件
   * @return {String} 返回js标签
  ###
  exportJs : (merge) ->
    @_getExportFilesHTML 'js', merge

  ###*
   * _getExportFilesHTML 获取引入文件列表对应的HTML
   * @param  {Boolean} merge 是否需要合并文件
   * @return {String} 返回html标签内容
  ###
  _getExportFilesHTML : (type, merge) ->
    if type == 'css'
      files = @cssFiles
    else
      files = @jsFiles
    files = _.uniq files
    hosts = @hosts
    resultFiles = []
    _.each files, (file) =>
      if !@_isFilter file
        resultFiles.push file
      else
        resultFiles.push file
    resultFiles = _.compact resultFiles
    resultFiles = _.uniq resultFiles, (item) ->
      if _.isArray item
        item.join ','
      else
        item
    if type == 'css'
      @_cssFiles = resultFiles
    else
      @_jsFiles = resultFiles
    if @options.debug && type != 'css'
      resultFiles = _.map resultFiles, (file) ->
        "/src#{file}"
    if @jtMerge && !@options.debug
      resultFiles = @jtMerge.getMergeExportFiles resultFiles
    htmlArr = _.map resultFiles, (file) =>
      @_getExportHTML file, type
    htmlArr.join ''

  ###*
   * _isFilter 判断该文件是否应该过滤的
   * @param  {String}  file 引入文件路径
   * @return {Boolean}      [description]
  ###
  _isFilter : (file) ->
    if file.substring(0, 7) == 'http://' || file.substring(0, 8) == 'https://'
      true
    else
      false
  ###*
   * _getExportHTML 返回生成的HTML
   * @param  {String} file   引入的文件
   * @param  {String} type   文件类型
   * @return {String} 返回相应的html
  ###
  _getExportHTML : (file, type) ->
    html = ''
    switch type
      when 'js' then html = @_exportJsHTML file
      else html = @_exportCssHTML file
    return html

  ###*
   * _exportJsHTML 返回引入JS的标签HTML
   * @param  {String} file   引入的文件
   * @return {String} 返回相应的html
  ###
  _exportJsHTML : (file) ->
    url = @_getUrl file
    '<script type="text/javascript" src="' + url + '"></script>'

  ###*
   * _exportCssHTML 返回引入CSS标签的HTML
   * @param  {String} file   引入的文件
   * @return {String} 返回相应的html
  ###
  _exportCssHTML : (file) ->
    url = @_getUrl file
    '<link rel="stylesheet" href="' + url + '" type="text/css" />'
  ###*
   * _getUrl 获取引用文件的URL
   * @param  {String} file 文件路径
   * @return {[type]}      [description]
  ###
  _getUrl : (file) ->
    hosts = @hosts
    version = @options.version
    if @options.crc32List
      crc32 = @options.crc32List[file]
      version = crc32 if crc32
    urlPrefix = @options.urlPrefix
    if urlPrefix && urlPrefix.charAt(0) != '/'
      urlPrefix = '/' + urlPrefix
    if !@_isFilter file
      if version
        file += "?v=#{version}"
      if file.charAt(0) != '/'
        file = '/' + file
      if urlPrefix
        file = "#{urlPrefix}#{file}"
      if hosts
        index = file.length % hosts.length
        host = hosts[index]
        file = host + file if host
    file
module.exports = FileImporter
