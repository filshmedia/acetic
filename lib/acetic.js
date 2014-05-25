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
    this.options = require(filename)[process.env.NODE_ENV || 'development'];
    this.options.relativePath = path.dirname(filename);
  } else {
    this.options = options;
    this.options.relativePath = path.dirname(module.parent.parent.filename);
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
    compile: true,

    // Should we resolve asset filenames to multiple names in case
    // they are mentioned in the `files` option?
    resolveFiles: true,
    assets: {}
  });

  // JavaScript options
  this.options.assets.javascripts = _.defaults(this.options.assets.javascripts || {}, {
    compiler: 'coffee',
    source: 'app/assets/javascripts',
    destination: 'assets/javascripts',
    minify: false,
    coffeeify: false,
    files: {}
  });

  // CSS options
  this.options.assets.stylesheets = _.defaults(this.options.assets.stylesheets || {}, {
    compiler: 'stylus',
    source: 'app/assets/stylesheets',
    destination: 'assets/stylesheets',
    minify: false,
    files: {}
  });
};

/*
 * Returns the middleware
 */
acetic.prototype.init = function () {
  var self = this;
  return function () {
    self.middleware.init.apply(self.middleware, arguments);
  };
};

/**
 * Executes the given command (if it exists)
 * @param {String} command
 */
acetic.prototype.executeCommand = function(command) {
  var self = this;
  switch (command) {
    case 'precompile':
      var commandModule = require('./commands/' + command)
        , commandInstance = new commandModule(self.options);

      commandInstance.run(function (err) {
        if (err) throw err;

        process.exit(0);
      });
      break;
    default:
      throw new Error('Command does not exist: ' + command);
      break;
  }
};

/**
 * Registers a new compiler
 * @param  {String} name
 * @param  {Object} compiler
 * @public
 */
acetic.prototype.registerCompiler = function(name, compiler) {
  this.middleware.registerCompiler(name, compiler);
};

module.exports = acetic;
