module.exports = function(config) {
    config.set({
        // base path, that will be used to resolve files and exclude
        basePath: './',

        frameworks: ['jasmine'],

        // list of files / patterns to load in the browser
        files: [
            // 3rd-party code
            'test/lib/jquery/jquery.js',
            'test/lib/jquery/jasmine-jquery.js',
            'test/lib/angular/1.2.16/angular.js',
            'test/lib/angular/1.2.16/angular-animate.js',
            'test/lib/angular/1.2.16/angular-mocks.js',
            'test/lib/angular/1.2.16/browserTrigger.js',

            // app code
            'src/js/core/directives/*.js',

            // tests
            'test/**/*Spec.js',

            // templates
            'src/templates/**/*.html'
        ],

        // list of files to exclude
        exclude: [

        ],

        preprocessors: {
            // location of templates
            'src/templates/**/*.html': ['html2js'],
            'src/js/**/*.js' : 'coverage'
        },

        reporters: ['dots', 'coverage'],

        // web server port
        // CLI --port 9876
        port: 9020,

        // enable / disable colors in the output (reporters and logs)
        // CLI --colors --no-colors
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        // CLI --log-level debug
        logLevel: config.LOG_INFO,

        // enable / disable watching file and executing tests whenever any file changes
        // CLI --auto-watch --no-auto-watch
        autoWatch: false,

        // Start these browsers, currently available:
        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera
        // - Safari (only Mac)
        // - PhantomJS
        // - IE (only Windows)
        // CLI --browsers Chrome,Firefox,Safari
        browsers: ['PhantomJS'],

        // If browser does not capture in given timeout [ms], kill it
        // CLI --capture-timeout 5000
        captureTimeout: 20000,

        // Auto run tests on start (when browsers are captured) and exit
        // CLI --single-run --no-single-run
        singleRun: false,

        // report which specs are slower than 500ms
        // CLI --report-slower-than 500
        reportSlowerThan: 500,

        plugins: [
            'karma-jasmine',
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-html2js-preprocessor',
            'karma-phantomjs-launcher',
            'karma-script-launcher',
            'karma-coverage'
        ]
    });
};