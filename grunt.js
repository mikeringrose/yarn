/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    meta: {
      version: '0.1.0',
      banner: '/*! PROJECT_NAME - v<%= meta.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '* http://PROJECT_WEBSITE/\n' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> ' +
        'Mike Ringrose; Licensed MIT */'
    },
    lint: {
      files: ['grunt.js', 'app/src/**/*.js', 'app/test/**/*.js']
    },
    qunit: {
      files: ['test/**/*.html']
    },
    concat: {
      dist: {
        src: ['<banner:meta.banner>', 
              'app/src/yarn.js', 
              'app/src/latlng.js', 
              'app/src/point.js',
              'app/src/map.js',
              'app/src/proj/projection.js', 
              'app/src/proj/sphericalmercator.js',
              'app/src/models/models.js',
              'app/src/models/features.js',              
              'app/src/models/viewport.js',
              'app/src/models/map.js',
              'app/src/models/marker.js',
              'app/src/views/zoomable.js',
              'app/src/views/draggable.js',
              'app/src/views/views.js',
              'app/src/views/map.js',
              'app/src/views/tilelayer.js',
              'app/src/views/tile.js',
              'app/src/views/features_layer.js',
              'app/src/views/marker.js'
            ],
        dest: 'dist/yarn.js'
      }
    },
    min: {
      dist: {
        src: ['<banner:meta.banner>', '<config:concat.dist.dest>'],
        dest: 'dist/yarn.min.js'
      }
    },
    watch: {
      files: '<config:lint.files>',
      tasks: 'lint qunit'
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        browser: true
      },
      globals: {
        jQuery: true,
        yarn: true,
        y: true,
        _: true,
        $: true,
        Backbone: true
      }
    },
    uglify: {}
  });

  // Default task.
  grunt.registerTask('default', 'lint qunit concat min');

};
