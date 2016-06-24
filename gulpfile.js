var gulp = require('gulp');
var Server = require('karma').Server;
var concat = require('gulp-concat');
var gulpProtractorAngular = require('gulp-angular-protractor');
const jscs = require('gulp-jscs');
var runSequence = require('gulp-run-sequence');
var autoprefixer = require('gulp-autoprefixer');
var replace = require('gulp-replace-path');
var path = require('path');
var clean = require('gulp-clean');

/**
 * Concat JS files
 */
gulp.task('concat', function() {
    return concatpayfields() && concatpayform() && concattokenizationform();
});

function concatpayfields() {
    return gulp.src(['./assets/js/helper.js',
                    './assets/js/validator.js',
                    './assets/js/ajaxHelper.js',
                    './payfields/assets/js/cc_input/model.js',
                    './payfields/assets/js/cc_input/view.js',
                    './payfields/assets/js/cc_input/controller.js',
                    './payfields/assets/js/cc_input/template.js',
                    './payfields/assets/js/form/model.js',
                    './payfields/assets/js/form/view.js',
                    './payfields/assets/js/form/controller.js',
                    './assets/js/event.js',
                    './payfields/assets/js/app.js'])
    .pipe(concat('beanstream_payfields.js'))
    .pipe(gulp.dest('build/payfields'));
}

function concatpayform() {
    return gulp.src(['./payform/assets/js/iframe/model.js',
                    './payform/assets/js/iframe/view.js',
                    './payform/assets/js/iframe/controller.js',
                    './payform/assets/js/iframe/template.js',
                    './assets/js/event.js',
                    './assets/js/helper.js',
                    './payform/assets/js/app.js'])
    .pipe(concat('beanstream_payform.js'))
    .pipe(gulp.dest('build/payform'));
}

function concattokenizationform() {
    return gulp.src(['./tokenizationform/assets/js/form/model.js',
                    './tokenizationform/assets/js/form/view.js',
                    './tokenizationform/assets/js/form/controller.js',
                    './tokenizationform/assets/js/form/template.js',
                    './assets/js/event.js',
                    './assets/js/helper.js',
                    './tokenizationform/assets/js/app.js'])
    .pipe(concat('script.js'))
    .pipe(gulp.dest('build/tokenizationform/js'));
}


/**
 * Checks for formatting consistency as set in ./.jssrc file
 * Fixes errors
 */
gulp.task('lint', ['pre-lint'], function() {
    return lint(src.payfields).pipe(gulp.dest('./payfields/assets/js/')) &&
        lint(src.payform).pipe(gulp.dest('./payform/assets/js/')) &&
        lint(src.tokenizationform).pipe(gulp.dest('./tokenizationform/assets/js/'));
});

/**
 * Checks if there are any errors that jscs cannot resolve
 * If 'lint' cannot fix an error it saves an empty string to the src file - so we rin 'pre-lint'
 */
gulp.task('pre-lint', function() {
    return lint(src.payfields) && lint(src.payform) && lint(src.tokenizationform);
    // return lintpayfields();
});

var src = {};
src.payfields = ['./payfields/assets/js/**/*.js'];
src.payform = ['./payform/assets/js/**/*.js'];
src.tokenizationform = ['./tokenizationform/assets/js/**/*.js'];

function lint(src) {
    return gulp.src(src)
        .pipe(jscs({fix: true}))
        .pipe(jscs.reporter())
        .pipe(jscs.reporter('fail'));
}

/**
 * Run unit test (karma) once and exit
 */
gulp.task('unit', function(done) {
    unit(done, unitConfigFile.payfields);
    // unitpayform(done);
    // unittokenizationform(done);
});

var unitConfigFile = {};
unitConfigFile.payfields = __dirname + '/payfields/tests/karma.conf.js';
unitConfigFile.payform = __dirname + '/payform/tests/karma.conf.js';
unitConfigFile.tokenizationform = __dirname + '/tokenizationform/tests/karma.conf.js';

function unit(done, configFile) {
    new Server({
        configFile: configFile,
        singleRun: true
    }, done).start();
}

/**
 * Watch for file changes and re-run tests on each change
 */
gulp.task('tdd', function(done) {
    new Server({
        configFile: __dirname + '/payfields/tests/karma.conf.js'
    }, done).start();
});

/**
 * Run e2e test (protractor) once and exit
 */
gulp.task('e2e', function(callback) {
    gulp
        .src(['./payfields/tests/e2e/spec.js'])
        .pipe(gulpProtractorAngular({
            'configFile': './payfields/tests/protractor.conf.js',
            'debug': false,
            'autoStartStopServer': true
        }))
        .on('error', function(e) {
            console.log(e);
        })
        .on('end', callback);
});

var e2eConfigFile = {};
e2eConfigFile.payfields = {src: ['./payfields/tests/e2e/spec.js'], configFile: './payfields/tests/protractor.conf.js'};
e2eConfigFile.payform = __dirname + '/payform/tests/karma.conf.js';
e2eConfigFile.tokenizationform = __dirname + '/tokenizationform/tests/karma.conf.js';

function e2e(callback, configFile) {
    gulp
        .src(configFile.src)
        .pipe(gulpProtractorAngular({
            'configFile': configFile.configFile,
            'debug': false,
            'autoStartStopServer': true
        }))
        .on('error', function(e) {
            console.log(e);
        })
        .on('end', callback);
}

gulp.task('default', function(cb) {
    runSequence('build', 'unit', cb);
});


/**
 * autoprefixe CSS for cfoss browser support
 */
gulp.task('css', function() {
    return gulp.src('./tokenizationform/assets/css/style.css')
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        //.pipe(gulp.dest('./tokenizationform/assets/css/build/'));
        .pipe(gulp.dest('./build/tokenizationform/css'));
});


/**
 * copy files to build output
 */
gulp.task('copy', function() {
  // payfields
  gulp.src(['./payfields/assets/css/beanstream_payfields_style.css'])
    . pipe(gulp.dest('./build/payfields'));
  // tokenizationform
  gulp.src(['./tokenizationform/index.html'])
    .pipe(gulp.dest('./build/tokenizationform'));
  gulp.src(['./tokenizationform/assets/css/spinner.css'])
    .pipe(gulp.dest('./build/tokenizationform/css'));
  gulp.src(['./tokenizationform/assets/css/images/*'])
    .pipe(gulp.dest('./build/tokenizationform/css/images'));
  // demos
  gulp.src(['./demos/**/*'])
    .pipe(gulp.dest('./build/demos'));
});

gulp.task('build', function(cb) {
    runSequence('lint', 'concat', 'css', 'copy', cb);
});
