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
        utils.ensurePathExists(path.dirname(options.destination), "/");

        fs.writeFile(options.destination, javascript, function (err) {
          callback(err);
        });
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

      writeStream = fs.createWriteStream(options.destination);

      b = browserify([options.source]);
      b.transform(coffeeify);
      b
        .bundle()
        .pipe(writeStream)
        .on('close', function () {
          callback(null);
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

      writeStream = fs.createWriteStream(options.destination);

      b = browserify([options.source]);
      b
        .bundle()
        .pipe(writeStream)
        .on('close', function () {
          callback(null);
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
        if(err) return callback(null);

        var nibPath = require.resolve('nib');
        var paths   = [path.dirname(options.source), path.resolve(nibPath, "..")];
        var style   = stylus(content.toString(), { paths: paths });

        style.render(function (err, css) {
          if(err) return callback(err);

          utils.ensurePathExists(path.dirname(options.destination), "/");
          fs.writeFile(options.destination, css, function (err) {
            callback(err);
          });
        });
      });
    }
  }
};
