module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            options: { force: true},
            templates: {
                src: ['build/dist/templates.js']
            },
            all: {
                src: ['build/**/*.*']
            }
        },
        concat: {
            dist: {
                src: ['src/js/**/*.js', '<%= ngtemplates.app.dest %>'],
                dest: 'build/dist/mdi-desktop.js',
                nonull: true
            }
        },
        ngtemplates:  {
            app: {
                src: 'src/**/*.html',
                dest: 'build/dist/templates.js',
                options: {
                    module: 'mdi.desktop'
                }
            }
        },
        uglify: {
            my_target: {
                files: {
                    'build/dist/mdi-desktop.min.js': ['build/dist/mdi-desktop.js']
                }
            }
        },
        copy: {
            main: {
                expand: true,
                cwd: 'build/',
                src: '**',
                dest: 'dist/',
                flatten: true,
                filter: 'isFile'
            }
        },
        'gh-pages': {
            options: {
                base: 'build',
                add:true,
                user: {
                    name: 'smithscripts',
                    email: 'rob.smith@outlook.com'
                }
            },
            src: '**/*'

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

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-angular-templates');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-gh-pages');
    grunt.loadNpmTasks('grunt-karma');


    grunt.registerTask('default', [
        'clean',
        'ngtemplates',
        'concat',
        'uglify',
        'clean:templates',
        'gh-pages',
        'copy',
        'clean',
        'karma:unit']);
}