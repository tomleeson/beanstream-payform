var gulp = require('gulp');
var Server = require('karma').Server;
var concat = require('gulp-concat');
var gulpProtractorAngular = require('gulp-angular-protractor');
const jscs = require('gulp-jscs');
var runSequence = require('gulp-run-sequence');
var autoprefixer = require('gulp-autoprefixer');
var replace = require('gulp-replace-path');
var path = require('path');

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
    .pipe(gulp.dest('./payfields/assets/js/build/'));
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
    .pipe(gulp.dest('./payform/assets/js/build/'));
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
    .pipe(gulp.dest('./tokenizationform/assets/js/build/'));
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
    runSequence('concat', 'lint', 'unit', cb);
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
        .pipe(gulp.dest('./tokenizationform/assets/css/build/'));
});

gulp.task('css', function() {
    return prefixCsstokenizationform();
});

function prefixCsstokenizationform() {
    return gulp.src('./tokenizationform/assets/css/style.css')
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(gulp.dest('./tokenizationform/assets/css/build/'));
}


/**
 * update paths for production and staging
 */
gulp.task('production', ['default'], function() {
    changePath('./payfields/assets/js/build/beanstream_payfields.js',
                './payfields/assets/js/build/',
                'http://localhost:8000/payfields/assets/css/beanstream_payfields_style.css',
                'https://payform.beanstream.com/payfields/beanstream_payfields_style.css');
    changePath('./payform/assets/js/build/beanstream_payform.js',
                './payform/assets/js/build/',
                'http://localhost:8000/tokenizationform/test.html',
                'https://payform.beanstream.com/tokenizationform/index.html');
    changePath('./tokenizationform/assets/js/build/script.js',
                './tokenizationform/assets/js/build/',
                'http://localhost:8000/payfields/assets/js/build/beanstream_payfields.js',
                'https://payform.beanstream.com/payfields/beanstream_payfields.js');

    setProduction('./payform/assets/js/build/beanstream_payform.js',
                './payform/assets/js/build/');
});

//var production = false;

gulp.task('staging', function() {
    changePath('./payfields/assets/js/build/beanstream_payfields.js',
                './payfields/assets/js/build/',
                'http://localhost:8000/payfields/assets/css/beanstream_payfields_style.css',
                'https://s3-us-west-2.amazonaws.com/payform-staging/payform/payfields/beanstream_payfields_style.css');
    changePath('./payform/assets/js/build/beanstream_payform.js',
                './payform/assets/js/build/',
                'http://localhost:8000/tokenizationform/test.html',
                'https://s3-us-west-2.amazonaws.com/payform-staging/payform/tokenizationform/index.html');
    changePath('./tokenizationform/assets/js/build/script.js',
                './tokenizationform/assets/js/build/',
                'http://localhost:8000/payfields/assets/js/build/beanstream_payfields.js',
                'https://s3-us-west-2.amazonaws.com/payform-staging/payform/payfields/beanstream_payfields.js');
});

function changePath(src, dest, oldPath, newPath) {
    return gulp.src([src])
        .pipe(replace(oldPath, newPath))
    .pipe(gulp.dest(dest));
}

function setProduction(src, dest) {

    return gulp.src([src])
        .pipe(replace(/var production/g, 'var production = true'))
    .pipe(gulp.dest(dest));
}


