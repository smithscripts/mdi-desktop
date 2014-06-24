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
            cssToBuild: {
                expand: true,
                cwd: 'src/css',
                src: '**',
                dest: 'build/dist',
                flatten: false
            },
            srcToDist: {
                expand: true,
                cwd: 'build/dist',
                src: '**',
                dest: 'dist/',
                flatten: false
            }
        },
        'gh-pages': {
            options: {
                base: 'build',
                repo: 'https://84227805282e52b258f61d8af56fa7f4554f3b6a@github.com/smithscripts/master.git',
                add:true
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
        'copy:cssToBuild',
        'gh-pages',
        'copy:srcToDist',
        'clean',
        'karma:unit']);
}