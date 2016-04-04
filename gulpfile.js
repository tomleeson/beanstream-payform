var gulp = require('gulp');
var Server = require('karma').Server;
var concat = require('gulp-concat');
var gulpProtractorAngular = require('gulp-angular-protractor');
const jscs = require('gulp-jscs');
var runSequence = require('gulp-run-sequence');


/**
 * Concat JS files
 */
gulp.task('concat', function() {
    return concatPayfields() && concatPayform() && concatTokenizationform();
});

function concatPayfields() {
    return gulp.src(['./assets/js/helper.js',
                    './assets/js/validator.js',
                    './assets/js/ajaxHelper.js',
                    './payFields/assets/js/cc_input/model.js',
                    './payFields/assets/js/cc_input/view.js',
                    './payFields/assets/js/cc_input/controller.js',
                    './payFields/assets/js/cc_input/template.js',
                    './payFields/assets/js/form/model.js',
                    './payFields/assets/js/form/view.js',
                    './payFields/assets/js/form/controller.js',
                    './assets/js/event.js',
                    './payFields/assets/js/app.js'])
    .pipe(concat('beanstream_payfields.js'))
    .pipe(gulp.dest('./payFields/assets/js/build/'));
}

function concatPayform() {
    return gulp.src(['./payForm/assets/js/iframe/model.js',
                    './payForm/assets/js/iframe/view.js',
                    './payForm/assets/js/iframe/controller.js',
                    './payForm/assets/js/iframe/template.js',
                    './assets/js/event.js',
                    './assets/js/helper.js',
                    './payForm/assets/js/app.js'])
    .pipe(concat('beanstream_payform.js'))
    .pipe(gulp.dest('./payForm/assets/js/build/'));
}

function concatTokenizationform() {
    return gulp.src(['./tokenizationForm/assets/js/form/model.js',
                    './tokenizationForm/assets/js/form/view.js',
                    './tokenizationForm/assets/js/form/controller.js',
                    './tokenizationForm/assets/js/form/template.js',
                    './assets/js/event.js',
                    './assets/js/helper.js',
                    './tokenizationForm/assets/js/app.js'])
    .pipe(concat('script.js'))
    .pipe(gulp.dest('./tokenizationForm/assets/js/build/'));
}


/**
 * Checks for formatting consistency as set in ./.jssrc file
 * Fixes errors
 */
gulp.task('lint', ['pre-lint'], function() {
    return lint(src.payfields).pipe(gulp.dest('./payFields/assets/js/')) &&
        lint(src.payform).pipe(gulp.dest('./payForm/assets/js/')) &&
        lint(src.tokenizationform).pipe(gulp.dest('./tokenizationForm/assets/js/'));
});

/**
 * Checks if there are any errors that jscs cannot resolve
 * If 'lint' cannot fix an error it saves an empty string to the src file - so we rin 'pre-lint'
 */
gulp.task('pre-lint', function() {
    return lint(src.payfields) && lint(src.payform) && lint(src.tokenizationform);
    // return lintPayfields();
});

var src = {};
src.payfields = ['./payFields/assets/js/**/*.js'];
src.payform = ['./payForm/assets/js/**/*.js'];
src.tokenizationform = ['./tokenizationForm/assets/js/**/*.js'];

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
    // unitPayform(done);
    // unitTokenizationform(done);
});

var unitConfigFile = {};
unitConfigFile.payfields = __dirname + '/payFields/tests/karma.conf.js';
unitConfigFile.payform = __dirname + '/payForm/tests/karma.conf.js';
unitConfigFile.tokenizationform = __dirname + '/tokenizationForm/tests/karma.conf.js';

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
        configFile: __dirname + '/payFields/tests/karma.conf.js'
    }, done).start();
});

/**
 * Run e2e test (protractor) once and exit
 */
gulp.task('e2e', function(callback) {
    gulp
        .src(['./payFields/tests/e2e/spec.js'])
        .pipe(gulpProtractorAngular({
            'configFile': './payFields/tests/protractor.conf.js',
            'debug': false,
            'autoStartStopServer': true
        }))
        .on('error', function(e) {
            console.log(e);
        })
        .on('end', callback);
});

var e2eConfigFile = {};
e2eConfigFile.payfields = {src: ['./payFields/tests/e2e/spec.js'], configFile: './payFields/tests/protractor.conf.js'};
e2eConfigFile.payform = __dirname + '/payForm/tests/karma.conf.js';
e2eConfigFile.tokenizationform = __dirname + '/tokenizationForm/tests/karma.conf.js';

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
    runSequence('concat', 'lint', 'unit', cb);
});
