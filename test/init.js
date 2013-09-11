process.env.NODE_ENV = 'test'

var express = require('express')
  , acetic  = require('../');

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
}
