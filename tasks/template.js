/**
 * Task: template
 * Description: copies a home page html file for the project dist directory
 * Dependencies: grunt, fs
 * Contributor: @searls
 *
 * Supported formats:
 *  html - template will merely be copied
 *  underscore (aliases: "us", "jst") - underscore templating
 *  handlebar (aliases: "hb", "handlebars") - handlebars templating
 *
 * When the template is processed, it will be passed the grunt configuration object,
 *   which contains lots of useful goodies.
 */

module.exports = function(grunt) {

  var cons = require('consolidate'),
      fs = require('fs'),
      _ = grunt.utils._;

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
    // Tell grunt this task is asynchronous.
    var done = this.async();


    _(['src', 'dest', 'variables']).each(function(attr){
      config.requiresConfig([config.name, config.target, attr].join('.'));
    });

    var engine = data.engine || getEngineOf(data.src);

    if(!engine){
      grunt.log.writeln("No compatable engine available");
      return false;
    }

    cons[engine](data.src, data.variables, function(err, html){
      if (err)
      {
        grunt.log.error(err);
        done(false);
      }
      grunt.file.write(data.dest, html);
      grunt.log.writeln("HTML written to '"+ data.dest +"'");
      done(true);
    });
  });
};
