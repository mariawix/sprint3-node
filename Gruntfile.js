'use strict';

module.exports = function(grunt) {

    grunt.config.init({
        jshint: {
            src: ['client/js/*.js', 'server.js', 'db/*.js'],
            options: {
                asi: true
            }
        },
        csslint: {
            src: ['client/css/*.css']
        },
        watch: {
            js: {
                files: ['client/js/*.js', 'server.js', 'db/*.js'],
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
                    'target/js/scripts.min.js': ['client/js/*.js', 'server.js', 'db/*.js']
                }
            }
        },
        cssmin: {
            main: {
                files: {
                    'target/css/style.min.css': ['client/css/*.css']
                }
            }
        },
        processhtml: {
            main: {
                'target/index.html': ['/client/index.html']
            }
        },
        copy: {
            main: {
                files: [
                    {
                        expand: true,
                        cwd: 'client',
                        src: ['img/*'],
                        dest: 'target/'
                    }
                ]
            }
        },
        eslint: {
            target: ['client/js/*.js', 'server.js', 'db/*.js']
        },
        dox: {
            options: {
                title: "Shopping Cart"
            },
            files: {
                src: ['client/js/*.js', 'server.js', 'db/*.js'],
                dest: 'docs'
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
    grunt.loadNpmTasks('grunt-eslint');
    grunt.loadNpmTasks('grunt-dox');

    grunt.registerTask('check', ['jshint', 'csslint']);
    grunt.registerTask('build', ['clean', 'copy', 'uglify', 'cssmin', 'processhtml']);

    grunt.registerTask('default', ['check', 'build', 'eslint', 'dox']);
    grunt.registerTask('dev', ['connect:dev']);
};