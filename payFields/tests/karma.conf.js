module.exports = function(config) {
    config.set({
        browsers: ['Chrome'],
        frameworks: ['jasmine'],
        files: [
            '../assets/js/build/**/*.js',
            './unit/**/*.spec.js'
        ]
    });
};
