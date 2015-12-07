module.exports = function(grunt) {

    grunt.initConfig({

        pkg: grunt.file.readJSON("package.json"),

        watch: {
            styles: {
                files: ['**/*.css'],
                tasks: ['cssmin'],
                options: {
                  spawn: false,
                },
            },
        },

        cssmin: {
            options: {
                sourceMap: true,
                rebase: true,
                shorthandCompacting: false,
                roundingPrecision: -1
            },
            target: {
                files: {
                    'styles.min.css': [
                        'bower_components/font-awesome/css/font-awesome.css',
                        'css/bootstrap.customised.css',
                        'css/styles.css'
                    ]
                }
            }
        },
        requirejs: {
            compile: {
                options: {
                    baseUrl: 'app',
                    mainConfigFile: 'app.js',
                    name: 'main',
                    out: 'modules.js'
                }
            }
        }
    });

    grunt.registerTask("default", ["watch"]);

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks("grunt-contrib-cssmin");
    grunt.loadNpmTasks('grunt-contrib-requirejs');
};
