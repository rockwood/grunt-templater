/**
 * Task: template
 * Description: copies a home page html file for the project dist directory
 * Dependencies: grunt, fs
 */

module.exports = function(grunt) {
  'use strict';

  var Promise = require('es6-promise').Promise;
  var consolidate = require('consolidate'),
      fs = require('fs');

  // TODO: ditch this when grunt v0.4 is released
  grunt.util = grunt.util || grunt.utils;

  var _ = grunt.util._;

  var extensions = {
    "dust"        : "dust",
    "eco"         : "eco",
    "ejs"         : "ejs",
    "haml"        : "haml",
    "haml-coffee" : "haml-coffee",
    "handlebars"  : "handlebars",
    "hbt"         : "handlebars",
    "hb"          : "handlebars",
    "handlebar"   : "handlebars",
    "hbs"         : "handlebars",
    "hogan"       : "hogan",
    "jade"        : "jade",
    "jt"          : "jade",
    "jazz"        : "jazz",
    "jqtpl"       : "jqtpl",
    "jst"         : "underscore",
    "liquor"      : "liquor",
    "mustache"    : "mustache",
    "QEJS"        : "QEJS",
    "swig"        : "swig",
    "underscore"  : "underscore",
    "us"          : "underscore",
    "walrus"      : "walrus",
    "whiskers"    : "whiskers"
  };

  function getEngineOf(fileName) {
    var extension = _(fileName.match(/[^.]*$/)).last();
    return  _( _(extensions).keys() ).include(extension) ? extensions[extension] : false;
  }

  grunt.registerMultiTask('template', 'generates an html file from a specified template', function(){
    var config = this;
    var data = this.data;
    var done = this.async();

    var hasFiles = !!this.files.length;
    var requiredAttributes = [ 'variables' ].concat(hasFiles ? [] : [ 'src', 'dest' ]);

    requiredAttributes.forEach(function(attribute) {
      config.requiresConfig([ config.name, config.target, attribute].join('.'));
    });

    var vars = data.variables;

    // If the variables are dynamic, grab them
    if (typeof vars === 'function') {
      vars = vars();
    }

    var compile = function compile(src, dest, vars) {
      var engine = data.engine || getEngineOf(src);
      return new Promise(function(resolve, reject) {
        if (!engine) {
          grunt.log.writeln("No compatable engine available");
          reject();
        }

        consolidate[engine](src, vars, function(err, html) {
          if (err) {
            grunt.log.error(err);
            reject();
          }
          grunt.file.write(dest, html);
          grunt.log.writeln("Generated html to '"+ dest +"'");
          resolve();
        });

      });
    };


    var asyncCompiles;

    if (hasFiles) {
      asyncCompiles = this.files.map(function(file) {
        var src = file.src.filter(function(filepath) {
          // Warn on and remove invalid source files (if nonull was set).
          if (!grunt.file.exists(filepath)) {
            grunt.log.warn('Source file "' + filepath + '" not found.');
            return false;
          } else {
            return true;
          }
        })[0];
        return compile(src, file.dest, vars);
      });
    } else {
      asyncCompiles = [ compile(data.src, data.dest, vars) ];
    }

    Promise.all(asyncCompiles).then(function() {
      done(true);
    }).catch(function() {
      done(false);
    });

  });
};