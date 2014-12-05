
'use strict';

module.exports = function(grunt) {
// Load Grunt tasks declared in the package.json file
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);


    grunt.initConfig({

// Grunt express - our webserver
// https://github.com/blai/grunt-express
        express: {
            all: {
                options: {
                    bases: process.cwd(),
                    port: 8080,
                    livereload: true
                }
            }
        },

// grunt-watch will monitor the projects files
// https://github.com/gruntjs/grunt-contrib-watch
        watch: {
            all: {
                files: '**/*.*',
                options: {
                    livereload: true
                }
            }
        }
    });

// Creates the `server` task
    grunt.registerTask('default', ['express','watch']);
};