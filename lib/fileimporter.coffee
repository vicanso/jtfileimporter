###*!
* Copyright(c) 2013 vicanso 腻味
* MIT Licensed
###

_ = require 'underscore'
fs = require 'fs'
path = require 'path'
events = require 'events'
isProductionMode = process.env.NODE_ENV == 'production'
coffeeScript = require 'coffee-script'
vm = require 'vm'


class FileImporter extends events.EventEmitter
  ###*
   * constructor 文件引入类
   * @return {FileImporter}       [description]
  ###
  constructor : (@options = {}) ->
    @cssFiles = []
    @jsFiles = []
    @hosts ?= @options.hosts
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
      @_cssFiles
    else
      @_jsFiles
  ###*
   * importCss 引入css文件
   * @param  {String} file     css路径
   * @return {FileImporter}         [description]
  ###
  importCss : (file) ->
    @importFiles file, 'css'
    @
  ###*
   * importJs 引入js文件
   * @param  {String} file    js路径
   * @return {FileImporter}         [description]
  ###
  importJs : (file) ->
    @importFiles file, 'js'
    @
  ###*
   * importFiles 引入文件
   * @param  {String} file    文件路径
   * @param  {String} type    文件类型(css, js)
   * @return {FileImporter}         [description]
  ###
  importFiles : (file, type) ->
    cssFiles = @cssFiles
    jsFiles = @jsFiles
    if _.isString file
      file = file.trim()
      if file.charAt(0) != '/' && !@_isFilter file
        file = '/' + file
      if type == 'css'
        if !~_.indexOf cssFiles, file
            cssFiles.push file
      else if !~_.indexOf jsFiles, file
          jsFiles.push file
    else if _.isArray file
      _.each file, (item) =>
        @importFiles item, type
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
    hosts = @hosts
    resultFiles = []
    _.each files, (file) =>
      if !@_isFilter file
        # file = @_convertExt file
        # 判断该文件是否在合并列表中
        # defineMergeList = fileMerger.getDefineMergeList file, @options.mergeList
        # if defineMergeList && isProductionMode
        #   resultFiles.push defineMergeList
        # else
        #   resultFiles.push file
        if type == 'js'
          resultFiles.push.apply resultFiles, @_getDependencies file
        else
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
    htmlArr = _.map resultFiles, (file) =>
      @_getExportHTML file, type
    htmlArr.join ''

    # mergeFile = (files) =>
    #   linkFileName = fileMerger.mergeFilesToTemp files, type, @options.path, @options.mergePath
    #   mergeUrlPrefix = @options.mergeUrlPrefix
    #   if mergeUrlPrefix
    #     linkFileName = "#{mergeUrlPrefix}/#{linkFileName}"
    #   @_getExportHTML linkFileName, type
    # 除预先定义需要合并的文件之外的所有文件  
    # otherFiles = []
    # htmlArr = _.map resultFiles, (result) =>
    #   if _.isArray result
    #     mergeFile result
    #   else if merge && !@_isFilter result
    #     otherFiles.push result
    #     ''
    #   else
    #     @_getExportHTML result, type
    # if otherFiles.length
    #   htmlArr.push mergeFile otherFiles
    # if @options.exportType == 'array' && type == 'js'
    #   '<script type="text/javascript">var JT_JS_FILES =' + JSON.stringify(htmlArr) + ';</script>'
    # else
    #   htmlArr.join ''

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
    urlPrefix = @options.urlPrefix
    if urlPrefix && urlPrefix.charAt(0) != '/'
      urlPrefix = '/' + urlPrefix
    if !@_isFilter file
      if version
        file += "?version=#{version}"
      if file.charAt(0) != '/'
        file = '/' + file
      if urlPrefix
        file = "#{urlPrefix}#{file}"
      if hosts
        index = file.length % hosts.length
        host = hosts[index]
        file = host + file if host
    file
  ###*
   * _convertExt 转换文件后缀
   * @param  {[type]} file [description]
   * @return {[type]}      [description]
  ###
  _convertExt : (file) ->
    convertExts = @options.convertExts
    if convertExts?.src && convertExts.dst
      dstExt = ''
      srcExt = _.find convertExts.src, (ext, i) ->
        if ext == file.substring file.length - ext.length
          dstExt = convertExts.dst[i]
          true
        else
          false
      if srcExt && dstExt
        file = file.substring(0, file.length - srcExt.length) + dstExt
    file
  _getDependencies : (file, hasCheckedFiles = []) ->
    result = []
    if ~_.indexOf hasCheckedFiles, file
      return result
    else
      hasCheckedFiles.push file
    staticPath = @options.path
    componentPath = @options.component
    if staticPath
      readFile = path.join staticPath, file 
    else
      readFile = file
    requireFiles = []
    if !fs.existsSync readFile
      readFile = readFile.replace path.extname(readFile), '.coffee'
      code = fs.readFileSync readFile, 'utf8'
      try
          code = coffeeScript.compile code
      catch err
        throw err if err
        return
    else
      code = fs.readFileSync readFile, 'utf8'
    context = _.clone @options.context
    context.require = (subFile) ->
      subFile += '.js' if !path.extname subFile
      requireFiles.push subFile
    try
      vm.runInNewContext code, context
    catch e
      console.error e
    _.each requireFiles, (tmpFile) =>
      tmpFile = path.join path.dirname(file), tmpFile if tmpFile[0] == '.'
      if !~_.indexOf result, tmpFile
        result.push.apply result, @_getDependencies tmpFile, hasCheckedFiles
    result.push file
    _.uniq _.flatten result
module.exports = FileImporter
