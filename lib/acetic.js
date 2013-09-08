require('js-yaml')
var path       = require('path')
  , fs         = require('fs')
  , path       = require('path')
  , _          = require('underscore')
  , utils      = require('./utils')
  , Middleware = require('./middleware')
  , compilers  = require('./compilers');

function acetic(options) {
  if (!options)
    throw new Error('No configuration given (either filename or hash)')

  if (typeof options === 'string') {
    // options is a filename, try to parse it
    var filename = options;
    filename = path.resolve(process.cwd(), filename);
    this.options = require(filename)[process.env.NODE_ENV];
    this.options.relativePath = path.dirname(filename);
  } else {
    this.options = options;
    this.options.relativePath = '.';
  }

  this.applyDefaultOptions();
  this.middleware = new Middleware(this.options);
  this.helper     = this.middleware.helper;
};

acetic.prototype.applyDefaultOptions = function() {
  this.options = _.defaults(this.options, {
    // Debug output when compiling
    debug: false,

    // Should we check the modified date before compiling?
    checkModifiedDate: true,

    // Should we compile the assets?
    compileAssets: true,

    // Should we resolve asset filenames to multiple names in case
    // they are mentioned in the `files` option?
    resolveFiles: true,

    // JavaScript options
    javascripts: {
      compiler: 'coffee',
      source: 'app/assets/coffeescript',
      destination: 'app/public/js',
      minify: false,
      coffeeify: false,
      files: {}
    },

    // CSS options
    stylesheets: {
      compiler: 'stylus',
      source: 'app/assets/stylus',
      destination: 'app/public/css',
      minify: false,
      files: {}
    }
  });
};

/*
 * Returns the middleware
 */
acetic.prototype.init = function () {
  var self = this;
  return function () {
    self.middleware.middleware.apply(self.middleware, arguments);
  };
};

/**
 * Executes the given command (if it exists)
 * @param {String} command
 */
acetic.prototype.executeCommand = function(command) {
  switch (command) {
    case 'precompile':
      this[command]();
      break;
    default:
      throw new Error('Command does not exist: ' + command);
      break;
  }
};

module.exports = acetic;
