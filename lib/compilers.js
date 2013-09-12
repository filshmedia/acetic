var fs = require("fs")
  , utils = require("./utils")
  , path = require("path");

module.exports = {
  "coffee": {
    sourceExtension: "coffee",
    destinationExtension: "js",
    minifyMethod: "uglifyjs",
    contentType: "application/x-javascript",
    compile: function(options, callback) {
      var coffeeScript = require("coffee-script");

      fs.readFile(options.source, function (err, content) {
        if(err) return callback(null);

        var javascript = coffeeScript.compile(content.toString());
        if (!options.destination) {
          callback(null, javascript);
        } else {
          utils.ensurePathExists(path.dirname(options.destination), "/");
          fs.writeFile(options.destination, javascript, function (err) {
            callback(err);
          });
        }
      });
    }
  },
  "coffeeify": {
    sourceExtension: "coffee|js",
    destinationExtension: "js",
    minifyMethod: "uglifyjs",
    contentType: "application/x-javascript",
    compile: function(options, callback) {
      var writeStream, b
        , browserify = require('browserify')
        , coffeeify  = require('coffeeify');

      b = browserify([options.source]);
      b.transform(coffeeify);
      b
        .bundle(null, function (err, javascript) {
          if (!options.destination) {
            callback(null, javascript);
          } else {
            utils.ensurePathExists(path.dirname(options.destination), "/");
            fs.writeFile(options.destination, javascript, function (err) {
              callback(err);
            });
          }
        });
    }
  },
  "browserify": {
    sourceExtension: "js",
    destinationExtension: "js",
    minifyMethod: "uglifyjs",
    contentType: "application/x-javascript",
    compile: function(options, callback) {
      var writeStream, b
        , browserify = require('browserify');

      b = browserify([options.source]);
      b
        .bundle(null, function (err, javascript) {
          if (!options.destination) {
            callback(null, javascript);
          } else {
            utils.ensurePathExists(path.dirname(options.destination), "/");
            fs.writeFile(options.destination, javascript, function (err) {
              callback(err);
            });
          }
        });
    }
  },
  "stylus": {
    sourceExtension: "styl",
    destinationExtension: "css",
    minifyMethod: "yui",
    contentType: "text/css",
    compile: function(options, callback) {
      var stylus = require("stylus");
      fs.readFile(options.source, function (err, content) {
        if (err) return callback(null);

        var nibPath = require.resolve('nib');
        var paths   = [path.dirname(options.source), path.resolve(nibPath, "..")];
        var style   = stylus(content.toString(), { paths: paths });

        style.render(function (err, css) {
          if (err) return callback(err);

          if (!options.destination) {
            callback(null, css);
          } else {
            utils.ensurePathExists(path.dirname(options.destination), "/");
            fs.writeFile(options.destination, css, function (err) {
              callback(err);
            });
          }
        });
      });
    }
  }
};
