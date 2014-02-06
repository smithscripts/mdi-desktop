module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            options: { force: true},
            all: {
                src: ['build/**/*.*']
            }
        },
        concat: {
            dist: {
                src: ['src/js/**/*.js'],
                dest: 'build/mdi-desktop.js'
            }
        },
        // Test settings
        karma: {
            options: {
                configFile: 'karma.conf.js',
                browsers: ['PhantomJS']
            },
            unit: {
                singleRun: true,
                options: {
                    reporters: ['dots', 'coverage']
                }
            },
            server: {
                autoWatch: true
            }
        }
    });

    grunt.registerTask('default', ['build']);
    grunt.registerTask('build', ['clean', 'concat']);
    grunt.registerTask('test', ['karma:unit']);

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-karma');
}