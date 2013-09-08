/**
 * acetic
 * simple yet powerful asset compilation engine for express 3.x
 *
 * @author Sascha Gehlich <sascha@gehlich.us>
 * @license MIT
 */
require('js-yaml')
var path   = require("path")
  , fs     = require("fs")
  , path   = require("path")
  , utils  = require("./utils")
  , _      = require("underscore")

function acetic(options) {
  if (!options)
    throw new Error('No configuration given (either filename or hash)')

  if (typeof options === "string") {
    // options is a filename, try to parse it
    var filename = options
    filename = path.resolve(process.cwd(), filename)
    this.relativePath = path.dirname(filename)
    this.options = require(filename)[process.env.NODE_ENV]
  } else {
    this.relativePath = "."
  }

  this.applyDefaultOptions();
  this.compilers = require("./compilers");
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
    self.middleware.apply(self, arguments);
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

/**
 * Proxy for console.debug
 */
acetic.prototype.debug = function() {
  var args = Array.prototype.slice.call(arguments);
  console.debug.apply(this, ["\x1B[1m\x1B[32macetic\x1B[39m\x1B[22m"].concat(args));
};

/*
 * The connect / express middleware
 */
acetic.prototype.middleware = function (req, res, next) {
  var assetTypes = ['javascripts', 'stylesheets'];

  // Attach our asset helpers
  this.attachAssetHelpers(res);

  // Skip middleware if we are not supposed to compile
  // assets at all
  if(!this.options.compileAssets)
    return next();

  // Build the absolute requested path
  var publicDir = path.resolve(this.relativePath, this.options.public)
    , relativeRequestedPath = req.path.replace(/^\//i, '')
    , requestedPath = path.resolve(publicDir, relativeRequestedPath);

  // Find out whether this is a file that we are supposed
  // to compile
  var assetType, assetConfig
    , assetPublicPath, assetSourcePath
    , assetCompiler
    , requestedFileIsCompilable = false;
  for(var i = 0; i < assetTypes.length; i++) {
    assetType       = assetTypes[i];
    assetConfig     = this.options[assetType];
    assetCompiler   = this.compilers[assetConfig.compiler];
    assetPublicPath = path.resolve(publicDir, assetConfig.destination);

    // Does the absolute requested path start with the public
    // path for this kind of assets?
    if(new RegExp("^" + assetPublicPath).test(requestedPath)) {
      requestedFileIsCompilable = true;

      // Build the absolute source path for this specific asset
      var sourceDir = path.resolve(this.relativePath, assetConfig.source)
      assetSourcePath = requestedPath.replace(new RegExp("^" + assetPublicPath), sourceDir)
      assetSourcePath = assetSourcePath.replace(
        new RegExp("\." + assetCompiler.destinationExtension + "$"),
        "." + assetCompiler.sourceExtension
      );

      break;
    }
  }

  if(!requestedFileIsCompilable)
    return next();

  this.serveOrCompileAsset(requestedPath, assetSourcePath, assetCompiler, next);
}

acetic.prototype.serveOrCompileAsset = function(destinationPath, sourcePath, compiler, next) {
  var destinationModifiedDate = utils.getModifiedDate(destinationPath)
    , sourceModifiedDate      = utils.getModifiedDate(sourcePath);
  if (sourceModifiedDate > destinationModifiedDate || !this.options.checkModifiedDate) {
    var options = {
      source: sourcePath,
      destination: destinationPath
    };

    compiler.compile(this, options, function (err) {
      if(err) throw err;

      next();
    })
  } else {
    next();
  }
}

/*
 * Attach asset helpers to locals
 */
acetic.prototype.attachAssetHelpers = function (res) {
  res.locals.jsAsset  = this.helper("javascripts");
  res.locals.cssAsset = this.helper("stylesheets");
}

/*
 * Build a helper for the given asset type
 */
acetic.prototype.helper = function (assetType) {
  var self = this
    , assetConfig = self.options[assetType]
    , assetFiles  = assetConfig.files;
  return function () {
    var files = [], finalFiles = []
      , content = ""
      , publicAssetPath = assetConfig.destination;

    if(typeof arguments[0] === "string") {
      files = Array.prototype.slice.call(arguments);
    } else if(arguments[0] instanceof Array) {
      files = arguments[0];
    }

    // Resolve the given filenames to multiple files in case
    // they are mentioned in the `files` configuration value
    if(self.options.resolveFiles) {
      var file;
      for(var i = 0; i < files.length; i++) {
        file = files[i]
        if (assetFiles[file] instanceof Array) {
          finalFiles = finalFiles.concat(assetFiles[file]);
        } else {
          finalFiles.push(file);
        }
      }
    } else {
      finalFiles = files;
    }

    finalFiles.forEach(function (file) {
      var filePath;
      if (/^https?/i.test(file))
        filePath = file;
      else
        filePath = "/" + publicAssetPath + "/" + file;

      switch(assetType) {
        case "javascripts":
          content += "<script src=\"" + filePath + "\"></script>";
          break;
        case "stylesheets":
          content += "<link rel=\"stylesheet\" href=\"" + filePath + "\" />";
          break;
      }
    });

    return content;
  };
};



module.exports = acetic;
