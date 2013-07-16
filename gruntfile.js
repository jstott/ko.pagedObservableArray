module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
		report:'min',
		mangle: false,
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
			files: {'knockout-pagedObservableArray.min.js':
				[
					'knockout-pagedObservableArray.js'
				]
			}
		}
    },
	jshint: {
		options: {
			jshintrc: '.jshintrc'
		},
		all: ['Gruntfile.js', 'knockout-pagedObservableArray.js']
	},
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  // task(s).
  grunt.registerTask('syntax', ['jshint']);
  grunt.registerTask('default', ['jshint','uglify']);

};