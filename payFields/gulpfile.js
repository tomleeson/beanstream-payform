var gulp = require('gulp');
var Server = require('karma').Server;
var concat = require('gulp-concat');

/**
 * Run test once and exit
 */
gulp.task('test', function (done) {
  new Server({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done).start();
});

/**
 * Watch for file changes and re-run tests on each change
 */
gulp.task('tdd', function (done) {
  new Server({
    configFile: __dirname + '/karma.conf.js'
  }, done).start();
});
 
 /**
 * Concat JS files
 */
gulp.task('scripts', function() {
  return gulp.src([ './assets/js/helper.js', 
                    './assets/js/validator.js', 
                    './assets/js/cc_input/model.js', 
                    './assets/js/cc_input/view.js',
                    './assets/js/cc_input/controller.js',
                    './assets/js/cc_input/template.js',
                    './assets/js/event.js',
                    './assets/js/app.js'])
    .pipe(concat('script.js'))
    .pipe(gulp.dest('./assets/js/build/'));
});

gulp.task('default', ['tdd']);


/*
  toDo reassess design of helper & validator
*/