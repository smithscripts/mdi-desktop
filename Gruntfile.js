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
}