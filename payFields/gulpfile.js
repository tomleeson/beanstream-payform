var gulp = require('gulp');
var Server = require('karma').Server;
var concat = require('gulp-concat');
var gulpProtractorAngular = require('gulp-angular-protractor');

/**
 * Run test once and exit
 */
gulp.task('unit', function (done) {
  new Server({
    configFile: __dirname + '/tests/karma.conf.js',
    singleRun: true
  }, done).start();
});

/**
 * Watch for file changes and re-run tests on each change
 */
gulp.task('tdd', function (done) {
  new Server({
    configFile: __dirname + '/tests/karma.conf.js'
  }, done).start();
});
 
 /**
 * Concat JS files
 */
gulp.task('scripts', function() {
  return gulp.src([ './assets/js/helper.js', 
                    './assets/js/validator.js',
                    './assets/js/ajaxHelper.js', 
                    './assets/js/cc_input/model.js', 
                    './assets/js/cc_input/view.js',
                    './assets/js/cc_input/controller.js',
                    './assets/js/cc_input/template.js',
                    './assets/js/form/model.js', 
                    './assets/js/form/view.js',
                    './assets/js/form/controller.js',
                    './assets/js/event.js',
                    './assets/js/app.js'])
    .pipe(concat('beanstream_payfields.js'))
    .pipe(gulp.dest('./assets/js/build/'));
});

gulp.task('default', ['tdd']);

 
gulp.task('e2e', function(callback) {
    gulp
        .src(['./tests/e2e/spec.js'])
        .pipe(gulpProtractorAngular({
            'configFile': './tests/protractor.conf.js',
            'debug': false,
            'autoStartStopServer': true
        }))
        .on('error', function(e) {
            console.log(e);
        })
        .on('end', callback);
});
