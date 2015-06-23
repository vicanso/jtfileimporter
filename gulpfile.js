var gulp = require('gulp');
var jshint = require('gulp-jshint');
var mocha = require('gulp-mocha');
var cover = require('gulp-coverage');
var istanbul = require('gulp-istanbul');

gulp.task('jshint', function() {
  return gulp.src('./lib/*.js')
    .pipe(jshint({
      predef : ['require', 'module'],
      node : true,
      esnext : true
    }))
    .pipe(jshint.reporter('default'));
});

gulp.task('test', function(){
  return gulp.src('./test/*.js')
    .pipe(istanbul())
    .pipe(mocha({reporter: 'spec'}))
    .pipe(istanbul.writeReports())
    .pipe(istanbul.enforceThresholds({
      thresholds : {
        global : 90
      }
    }));
});

gulp.task('default', ['jshint', 'test']);



// .on('finish', function () {
//       gulp.src(['test/*.js'])
//         .pipe(mocha())
//         .pipe(istanbul.writeReports()) // Creating the reports after tests ran
//         .pipe(istanbul.enforceThresholds({ thresholds: { global: 90 } })) // Enforce a coverage of at least 90%
//         .on('end', cb);
//     });