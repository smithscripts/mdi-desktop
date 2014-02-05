module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                // define a string to put between each file in the concatenated output
                separator: ';'
            },
            dist: {
                // the files to concatenate
                src: ['src/js/**/*.js'],
                // the location of the resulting JS file
                dest: '<%= pkg.name %>.js'
            }
        }
    });

    // Load grunt-karma task plugin
    grunt.loadNpmTasks('grunt-karma');
    // Load the grunt-contrib-watch plugin for doing file watches
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask('test', ['jshint', 'karma:unit']);

    // Task for development; auto-build ng-grid.debug.js on source file changes, auto-test on ng-grid.debug.js or unit test changes
    grunt.registerTask('testwatch', ['jshint', 'karma:watch', 'watch']);

    grunt.registerTask('test-ci', ['jshint', 'debug', 'karma:ci']);

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-less');
    //grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.loadNpmTasks('grunt-angular-templates');
    grunt.loadNpmTasks('grunt-contrib-clean');

    // Old default task
    grunt.registerTask('build', ['less', 'ngtemplates', 'concat', 'uglify', 'clean']);

    // Default task(s).
    grunt.registerTask('default', 'No default task', function() {
        grunt.log.write('The old default task has been moved to "build" to prevent accidental triggering');
    });

    grunt.registerTask('debug', ['less', 'ngtemplates', 'concat:debug', 'clean']);
    grunt.registerTask('prod', ['less', 'ngtemplates', 'concat:prod', 'uglify', 'clean']);
    grunt.registerTask('version', ['ngtemplates', 'concat:version', 'uglify:version', 'clean']);
}