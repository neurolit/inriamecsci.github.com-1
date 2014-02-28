/*jslint node:true*/

module.exports = function (grunt) {

    'use strict';

    grunt.loadNpmTasks('grunt-jslint'); // load the task
    grunt.loadNpmTasks('assemble');

    grunt.initConfig({

        jslint: {
            all: {
                src: [
                    'grains/*/meta.json',
                    'Gruntfile.js'
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
        }
    });

    // default task.
    grunt.registerTask('default', ['jslint', 'generer_index_grains', 'generer_README']);

    grunt.registerTask('generer_README', 'assemble:README');

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
            return a.name.toLowerCase().localeCompare(b.name.toLowerCase(), "fr");
        });
        grunt.file.write("grains/index.json", JSON.stringify(seeds, null, 4));
    });

};
