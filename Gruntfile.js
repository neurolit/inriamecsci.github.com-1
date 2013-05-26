/*jslint node:true*/

module.exports = function (grunt) {

    'use strict';

    grunt.loadNpmTasks('grunt-jslint'); // load the task

    grunt.initConfig({

        jslint: {
            files: [
                'grains/*/meta.json'
            ],
            options: {
                failOnError: true
            }
        }

    });

    // default task.
    grunt.registerTask('default', ['jslint', 'generer_index_grains']);

    // Travis CI task.
    grunt.registerTask('travis', 'jslint');

    grunt.registerTask('generer_index_grains', function() {
        var seeds = [] ;
        grunt.file.expand('grains/*/meta.json').forEach(
            function(fileName) {
                var seedData = grunt.file.readJSON(fileName) ;
                var seed = {} ;
                seed['id'] = fileName ;
                seed['id'] = seed['id'].replace(/^grains\//,'') ;
                seed['id'] = seed['id'].replace(/\/meta\.json$/,'') ;
                seed['name'] = seedData['name'] ;
                if ('link' in seedData) {
                    seed['uri'] = seedData['link'] ;
                } else {
                    seed['uri'] = seedData['links'][0]['uri'] ;
                }
                seeds.push(seed) ;
            }
        ) ;
        grunt.file.write("grains/index.json",JSON.stringify(seeds, null, 4)) ;
    });

};
