/*jslint node:true*/

module.exports = function (grunt) {

    'use strict';

    grunt.loadNpmTasks('grunt-jslint'); // load the task
    grunt.loadNpmTasks('assemble');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-uncss');

    grunt.initConfig({

        copy: {
            fonts: {
                files: [
                // includes files within path
                    { expand: true, cwd: 'bower_components/font-awesome/fonts/', src: [ '*' ], dest: 'fonts/', filter: 'isFile'},
                ]
            }
        },

        jslint: {
            all: {
                src: [
                    'grains/*/meta.json',
                    'Gruntfile.js',
                    'js/{app,controllers}.js'
                ],
                options: {
                    failOnError: true
                }
            }
        },

        assemble: {
            README: {
                options: {
                    data: 'grains/index.json',
                    ext: ''
                },
                src: './README.md.hbs',
                dest: './'
            }
        },

        concat: {
            css: {
                src: [
                    'bower_components/bootstrap/dist/css/bootstrap.css',
                    'bower_components/font-awesome/css/font-awesome.css',
                    'css/inria.css'
                ],
                dest: 'css/combined.css'
            },
            app_js: {
                src: [
                    'js/plugins.js',
                    'js/main.js',
                    'js/app.js',
                    'js/controllers.js'
                ],
                dest: 'js/app.combined.js'
            },
            js: {
                src: [
                    'bower_components/jquery/dist/jquery.min.js',
                    'bower_components/bootstrap/dist/js/bootstrap.min.js',
                    'bower_components/angular/angular.min.js',
                    'bower_components/angular-route/angular-route.min.js',
                    'js/app.combined.min.js'
                ],
                dest: 'js/combined.min.js'
            }
        },

        cssmin : {
            combined: {
                src: 'css/combined.css',
                dest: 'css/combined.min.css'
            }
        },

        uglify : {
            app_js: {
                files: {
                    'js/app.combined.min.js' : [ 'js/app.combined.js' ]
                }
            }
        },

        uncss: {
            combined: {
                files: {
                    'css/combined.css': ['index.html', 'partials/grains-detail.html', 'partials/grains-list.html', 'partials/grains-meta.html']
                }
            }
        },
    });

    // default task.
    grunt.registerTask('default', ['jslint', 'copy:fonts', 'generer_js', 'generer_css', 'generer_index_grains', 'assemble:README']);

    grunt.registerTask('generer_js', ['concat:app_js', 'uglify:app_js', 'concat:js']);
    grunt.registerTask('generer_css', ['concat:css', 'uncss:combined', 'cssmin:combined']);

    // Travis CI task.
    grunt.registerTask('test', 'jslint');

    grunt.registerTask('generer_index_grains', function () {
        var seeds = [];
        grunt.file.expand('grains/*/meta.json').forEach(
            function (fileName) {
                var seedData = grunt.file.readJSON(fileName),
                    seed = {};
                seed.id = fileName;
                seed.id = seed.id.replace(/^grains\//, '');
                seed.id = seed.id.replace(/\/meta\.json$/, '');
                seed.name = seedData.name;
                if (seedData.hasOwnProperty('link')) {
                    seed.uri = seedData.link;
                } else {
                    seed.uri = seedData.links[0].uri;
                }
                seeds.push(seed);
            }
        );
        seeds.sort(function (a, b) {
            // accents are badly sorted by V8 Javascript, nothing to do about that
            // See https://github.com/joyent/node/issues/4689
            // Or http://code.google.com/p/v8/issues/detail?id=459
            return a.name.toLowerCase().localeCompare(b.name.toLowerCase(), "fr");
        });
        grunt.file.write("grains/index.json", JSON.stringify(seeds, null, 4));
    });

};
