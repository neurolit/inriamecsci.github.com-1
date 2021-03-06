/*jslint node:true*/

module.exports = function (grunt) {

    'use strict';

    grunt.loadNpmTasks('grunt-jslint'); // load the task
    grunt.loadNpmTasks('grunt-assemble');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-uncss');
    grunt.loadNpmTasks('grunt-spritesmith');

    grunt.initConfig({

        sprite: {
            all: {
                'src': 'grains/*/snapshots/120px.png',
                'dest': 'css/snapshots.png',
                'destCss': 'css/snapshots.css',
                'algorithm': 'binary-tree',
                'cssVarMap': function (sprite) {
                    // `sprite` has `name`, `image` (full path), `x`, `y`
                    //   `width`, `height`, `total_width`, `total_height`
                    // EXAMPLE: Prefix all sprite names with 'sprite-'
                    var seed = sprite.source_image.split('/')[1];
                    sprite.name = seed + '-' + sprite.name;
                }
            }
        },

        copy: {
            fonts: {
                files: [
                // includes files within path
                    {expand: true, cwd: 'bower_components/font-awesome/fonts/', src: ['*'], dest: 'fonts/', filter: 'isFile'}
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
                    'css/inria.css',
                    'css/snapshots.css'
                ],
                dest: 'css/combined.min.css'
            },
            app_js: {
                src: [
                    'js/plugins.js',
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

        cssmin: {
            combined: {
                src: 'css/combined.min.css',
                dest: 'css/combined.min.css'
            }
        },

        uglify: {
            app_js: {
                files: {
                    'js/app.combined.min.js': ['js/app.combined.js']
                }
            }
        },

        uncss: {
            combined: {
                files: {
                    'css/combined.min.css': ['index.html', 'partials/grains-detail.html', 'partials/grains-list.html', 'partials/grains-meta.html']
                },
                options: {
                    ignore: [/dropdown/, /icon/]
                }
            }
        }
    });

    // default task.
    grunt.registerTask('default', ['jslint', 'copy:fonts', 'generer_js', 'generer_css', 'generer_index_grains', 'assemble:README']);

    grunt.registerTask('generer_js', ['concat:app_js', 'uglify:app_js', 'concat:js']);
    grunt.registerTask('generer_css', ['sprite:all', 'concat:css', 'uncss:combined', 'cssmin:combined']);

    // Travis CI task.
    grunt.registerTask('test', 'jslint');

    grunt.registerTask('generer_index_grains', function () {
        var seeds = [];
        grunt.file.expand('grains/*/meta.json').forEach(
            function (fileName) {
                var seedData = grunt.file.readJSON(fileName),
                    seed = {};
                if (seedData.status && seedData.status === 'deprecated') {
                    // this seed should not be displayed
                    return;
                }
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
