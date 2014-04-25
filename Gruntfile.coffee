module.exports = (grunt) ->

  getTestConfig = ->
    path = require 'path'
    fs = require 'fs'
    testPath = path.join __dirname, 'test'
    files = fs.readdirSync testPath
    config = {}
    files.forEach (file) ->
      ext =  path.extname file
      if ext == '.js'
        name = path.basename file, ext
        config["unit_#{name}"] =
          command : "mocha test/#{file}"
        config["cov_#{name}"] = 
          command : "NODE_ENV=cov mocha -R html-cov test/#{file} --coverage > html/#{name}.html"
    config
  grunt.initConfig {
    clean : ['log/*', 'dest']
    coffee : 
      node :
        expand : true
        cwd : 'src'
        src : ['*.coffee']
        dest : 'dest'
        ext : '.js'
      test :
        expand : true
        cwd : 'test_src'
        src : ['*.coffee']
        dest : 'test'
        ext : '.js'
    jshint :
      all : ['dest/*.js']
      options : 
        eqnull : true
    shell : getTestConfig()

  }


  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-clean'
  grunt.loadNpmTasks 'grunt-contrib-jshint'
  grunt.loadNpmTasks 'grunt-shell-spawn'

  grunt.registerTask 'gen', ['clean', 'coffee', 'jshint']
  grunt.registerTask 'test', ['gen', 'shell']
  grunt.registerTask 'default', ['gen']