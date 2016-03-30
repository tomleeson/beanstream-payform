var gulp = require('gulp');
var Server = require('karma').Server;
var concat = require('gulp-concat');
var gulpProtractorAngular = require('gulp-angular-protractor');
const jscs = require('gulp-jscs');

/**
 * Concat JS files
 */
gulp.task('concat', function() {
    return gulp.src(['./assets/js/helper.js',
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

/**
 * Checks for formatting consistency as set in ./.jssrc file
 * Fixes errors
 */
gulp.task('lint', ['pre-lint'], function() {
    return gulp.src(['./assets/js/**/*.js'])
        .pipe(jscs({ fix: true }))
        .pipe(jscs.reporter())
        .pipe(jscs.reporter('fail'))
        .pipe(gulp.dest('./assets/js/'));
});

/**
 * Checks if there are any errors that jscs cannot resolve
 * The purpose is to run as a pre-task to 'lint'.
 * This is necessary as 'lint' is configured to try to fix errors.
 * If 'lint' cannot fix an error it saves an empty string to the src file - so we rin 'pre-lint'
 */
gulp.task('pre-lint', function() {
    return gulp.src(['./assets/js/**/*.js'])
        .pipe(jscs({ fix: true }))
        .pipe(jscs.reporter())
        .pipe(jscs.reporter('fail'));
});

/**
 * Run unit test (karma) once and exit
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
 * Run e2e test (protractor) once and exit
 */
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

/**
 * Default task
 */
gulp.task('default', ['tdd']);
