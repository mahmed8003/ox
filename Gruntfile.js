module.exports = function (grunt) {

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-file-append');
    grunt.loadNpmTasks('grunt-typescript');


    grunt.initConfig({
        typescript: {
            base: {
                src: ['./src/**/*.ts'],
                dest: './build/OX.js',
                options: {
                    module: 'commonjs', //or commonjs
                    target: 'es5', //or es
                    basePath: './src',
                    sourceMap: false,
                    declaration: true,
                    comments: false,
                    references: [
                        "./libraries/*.d.ts"
                    ]
                }
            }
        },
        file_append: {
            ox: {
                files: {
                    'build/OX.js': {
                        append: "\nmodule.exports = OX;"
                    }
                }
            }
        }
    });



    // define the tasks
    grunt.registerTask(
        'build_framework',
        'Compiles all of the assets and copies the files to the build directory.',
        ['typescript', 'file_append:ox']
    );

    // latter we will register build_test task

    grunt.registerTask('default', ['build_framework']);
}
