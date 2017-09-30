// Karma configuration
// Generated on 7/7/2017

module.exports = function (config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: './',


        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine', 'browserify'],


        // list of files / patterns to load in the browser
        files: [
            { pattern: 'diff*.js', nocache: true },  // The star is used to watch the directory rather than this specific file due to a visual studio bug and karma
            { pattern: 'spec/diff.spec*.js', nocache: true }   // but instead of literally watching the entire directory, watch for files in this directory with this regex pattern. ie, these specific files
        ],

        plugins: [
            'karma-jasmine',
            'karma-browserify',
            'karma-chrome-launcher'
        ],

        ngHtml2JsPreprocessor: {
            prependPrefix: '',
            moduleName: 'templates',
            cacheIdFromPath: function (filepath) {
                return filepath;
            },
        },

        // list of files to exclude
        exclude: [
        ],


        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
         
        },


        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress'],


        // web server port
        port: 9876,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_DEBUG,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,


        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        // 'karma start --browsers=Chrome' to start Chrome only session. --browsers=[Chrome|IE|Firefox|PhantomJS]. 
        // Default --browsers=['Chrome', 'Firefox', 'IE']
        //browsers: config.browsers === 'PhantomJS' ? ['PhantomJS'] : config.browsers === 'Chrome' || config.browsers === 'chrome' ? ['Chrome'] : ['Chrome', 'Firefox', 'IE'],
        browsers: ['Chrome'],
        // 'karma start --single-run=true' to start singleRun session. 


        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        // Default --singleRun=false
        //singleRun: config.singleRun ? true : false,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity
    })
}
