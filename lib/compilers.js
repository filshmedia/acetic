var coffeeScript = require("coffee-script")
  , stylus = require("stylus")
  , fs = require("fs");

module.exports = {
  "js": {
    sourceExtension: "coffee",
    destinationExtension: "js",
    contentType: "application/x-javascript",
    compile: function(options, callback) {
      fs.readFile(options.source, function (err, content) {
        if(err) return callback(err);

        var javascript = coffeeScript.compile(content.toString());

        fs.writeFile(options.destination, javascript, function (err) {
          callback(err);
        });
      });
    }
  },
  "css": {
    sourceExtension: "styl",
    destinationExtension: "css",
    contentType: "text/css",
    compile: function(options, callback) {
      fs.readFile(options.source, function (err, content) {
        if(err) return callback(err);

        var style = stylus(content.toString(), {});
        style.render(function (err, css) {
          if(err) return callback(err);

          fs.writeFile(options.destination, css, function (err) {
            callback(err);
          });
        });
      });
    }
  }
};
