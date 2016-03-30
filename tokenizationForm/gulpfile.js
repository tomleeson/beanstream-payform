var gulp = require('gulp');
var Server = require('karma').Server;
var concat = require('gulp-concat');
var gulpProtractorAngular = require('gulp-angular-protractor');
const jscs = require('gulp-jscs');

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
gulp.task('concat', function() {
    return gulp.src(['./assets/js/form/model.js',
                    './assets/js/form/view.js',
                    './assets/js/form/controller.js',
                    './assets/js/form/template.js',
                    './assets/js/event.js',
                    './assets/js/app.js'])
    .pipe(concat('script.js'))
    .pipe(gulp.dest('./assets/js/build/'));
});

// pre-lint task checks if there are any errors that jscs cannot resolve
gulp.task('lint', ['pre-lint'], function() {
    return gulp.src(['./assets/js/**/*.js'])
        .pipe(jscs({ fix: true }))
        .pipe(jscs.reporter())
        .pipe(jscs.reporter('fail'))
        .pipe(gulp.dest('./assets/js/'));
});

gulp.task('pre-lint', function() {
    return gulp.src(['./assets/js/**/*.js'])
        .pipe(jscs({ fix: true }))
        .pipe(jscs.reporter())
        .pipe(jscs.reporter('fail'));
});

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

// linting takes 1.4 s!
// gulp.task('scripts', ['lint', 'concat']);
gulp.task('scripts', ['concat']);

gulp.task('default', ['tdd']);
