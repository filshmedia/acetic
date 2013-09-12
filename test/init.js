process.env.NODE_ENV = 'test'

var express = require('express')
  , acetic  = require('../')
  , Precompiler = require('../lib/precompiler')
  , fs = require('fs');

global._after = function (t, f) { return setTimeout(f, t); };
global._every = function (t, f) { return setInterval(f, t); };

global.mockServer = function(options) {
  var app = {}
    , _acetic = new acetic(options);

  app.server = express();
  app.acetic = _acetic;
  app.server.use(_acetic.init());
  app.server.use(express.static(__dirname + '/app/public'));

  app.server = app.server.listen(8899);

  return app;
};

global.runPrecompiler = function(options, callback) {
  // Clean this mess up
  cleanDirectory(__dirname + '/app/public/assets/javascripts', 'js');
  cleanDirectory(__dirname + '/app/public/assets/stylesheets', 'css');

  // Create an instance of acetic to apply
  // the default options
  var _acetic = new acetic(options);
  var precompiler = new Precompiler(_acetic.options);
  precompiler.run(callback);
};

global.cleanDirectory = function(directory, filetype) {
  var files = fs.readdirSync(directory);
  files.forEach(function (file) {
    var filePath = directory + '/' + file;
    if (!fs.statSync(filePath).isDirectory()
      && file.split('.').pop().toLowerCase() === filetype) {
        fs.unlinkSync(filePath);
    }
  });
};

global.expectFileEquality = function(fileA, fileB) {
  var fileAContent = fs.readFileSync(fileA).toString()
    , fileBContent = fs.readFileSync(fileB).toString();

  fileAContent.should.equal(fileBContent);
}
