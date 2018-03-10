
module.exports = function(grunt) {  
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      dist: {
        files: {
          'dist/<%= pkg.name %>.js': 
          ['src/**.js']
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify-es');

  grunt.registerTask('build', 
    ['uglify:dist']);

  grunt.registerTask('default', 
    ['uglify:dist']);
};