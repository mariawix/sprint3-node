'use strict';

module.exports = function(grunt) {

    grunt.config.init({
        jshint: {
            src: ['client/js/*.js', 'server.js'],
            options: {
                asi: true
            }
        },
        csslint: {
            src: ['client/css/*.css']
        },
        watch: {
            js: {
                files: ['client/js/*.js'],
                tasks: ['jshint']
            },
            css: {
                files: ['client/css/*.css'],
                tasks: ['csslint']
            }
        },
        clean: {
            src: ['target']
        },
        uglify: {
            main: {
                files: {
                    'target/scripts.min.js': ['client/js/*.js', 'server.js']
                }
            }
        },
        cssmin: {
            main: {
                files: {
                    'target/style.min.css': ['client/css/*.css']
                }
            }
        },
        processhtml: {
            options: {
                // Task-specific options go here.
            },
            'target/index.html': ['/client/index.html']
        },
        copy: {
            main: {
                files: [
                    {
                        expand: true,
                        cwd: 'client/',
                        src: ['**', '!js/**', '!css/**', '!index.html'],
                        dest: 'target/'
                    }
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-csslint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-processhtml');

    grunt.registerTask('check', ['jshint', 'csslint']);
    grunt.registerTask('build', ['clean', 'copy', 'uglify', 'cssmin', 'processhtml']);

    grunt.registerTask('default', ['check', 'build']);
    grunt.registerTask('dev', ['connect:dev']);
};