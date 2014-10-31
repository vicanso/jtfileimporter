var gulp = require('gulp');
var jshint = require('gulp-jshint');
var mocha = require('gulp-mocha');
var cover = require('gulp-coverage');

gulp.task('jshint', function() {
  return gulp.src('./lib/*.js')
    .pipe(jshint({
      predef : ['require', 'module'],
      node : true
    }))
    .pipe(jshint.reporter('default'));
});

gulp.task('test', function(){
  return gulp.src('./test/*.js')
    .pipe(cover.instrument({
      pattern : ['./lib/*.js']
    }))
    .pipe(mocha({reporter: 'nyan'}))
    .pipe(cover.report({
      outFile : 'coverage.html'
    }));
})

gulp.task('default', ['jshint', 'test']);