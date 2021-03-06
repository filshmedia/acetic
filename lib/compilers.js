var fs = require("fs")
  , utils = require("./utils")
  , path = require("path");

module.exports = {
  "coffee": {
    sourceExtensions: ["coffee"],
    destinationExtension: "js",
    minifyMethod: "uglifyjs",
    contentType: "application/x-javascript",
    compile: function(options, callback) {
      var coffeeScript = require("coffee-script");

      fs.readFile(options.source, function (err, content) {
        if(err) return callback(null);

        var javascript;

        try {
          javascript = coffeeScript.compile(content.toString());
        } catch (e) {
          if (options.destination) {
            javascript = utils.createErrorJavascript({
              message: e.message,
              filePath: options.source,
              fileContent: content.toString(),
              line: e.location.last_line
            });
          } else {
            throw(e);
          }
        }

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
    sourceExtensions: ["coffee", "js"],
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
          if (err) {
            if (options.destination) {
              var message = err.toString().split('\n')[0]
                , line;

              message     = message.substr(0, message.lastIndexOf(':'));
              line        = message.substr(message.lastIndexOf(':'), -1);

              javascript = utils.createErrorJavascript({
                message: message,
                filePath: options.source,
                fileContent: fs.readFileSync(options.source).toString(),
                line: line
              });
            } else {
              throw(err);
            }
          }
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
    sourceExtensions: ["js"],
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
    sourceExtensions: ["styl"],
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
          if (err) {
            if (options.destination) {
              css = utils.createErrorCSS({
                message: err.message,
                filePath: options.source,
                fileContent: content.toString(),
                line: 0
              });
            } else {
              throw(err);
            }
          }

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
