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
  , colors = require("colors")
  , path   = require("path")

function acetic(options) {
  if (typeof options === "string") {
    // options is a filename, try to parse it
    var filename = options
    filename = path.resolve(process.cwd(), filename)
    this.relativePath = path.dirname(filename)
    this.options = require(filename)[process.env.NODE_ENV]
  } else {
    this.relativePath = "."
  }

  this.applyDefaultOptions()

  this.compilers = require("./compilers");
};

acetic.prototype.applyDefaultOptions = function() {
  // Debug output when compiling
  this.options.debug = this.options.debug || false

  // Should we check the modified date before compiling?
  this.options.checkModifiedDate = this.options.checkModifiedDate || true

  // Should we compile the assets?
  this.options.compileAssets = this.options.compileAssets || true

  // Should we resolve asset filenames to multiple names in case
  // they are mentioned in the `files` option?
  this.options.resolveFiles = this.options.resolveFiles || true

  // Javascript options
  this.options.javascripts = this.options.javascripts || {}
  this.options.compiler = this.options.compiler || "coffee"
  this.options.javascripts.source =
    this.options.javascripts.source || "app/assets/coffeescript"
  this.options.javascripts.destination =
    this.options.javascripts.destination || "app/public/js"
  this.options.javascripts.minify =
    this.options.javascripts.minify || false
  this.options.javascripts.coffeeify =
    this.options.javascripts.coffeeify || false
  this.options.javascripts.files =
    this.options.javascripts.files || {}

  // CSS options
  this.options.stylesheets = this.options.stylesheets || {}
  this.options.compiler = this.options.compiler || "stylus"
  this.options.stylesheets.source =
    this.options.stylesheets.source || "app/assets/stylus"
  this.options.stylesheets.destination =
    this.options.stylesheets.destination || "app/public/css"
  this.options.stylesheets.minify =
    this.options.stylesheets.minify || false
  this.options.stylesheets.files =
    this.options.stylesheets.files || {}
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

acetic.prototype.log = function() {
  var args = Array.prototype.slice.call(arguments)
  console.log.apply(this, ["acetic".green.bold].concat(args))
};

/*
 * The connect / express middleware
 */
acetic.prototype.middleware = function (req, res, next) {
  var assetTypes = ['javascripts', 'stylesheets']

  // Attach our asset helpers
  this.attachAssetHelpers(res);

  // Skip middleware if we are not supposed to compile
  // assets at all
  if(!this.options.compileAssets)
    return next();

  // Build the absolute requested path
  var publicDir = path.resolve(this.relativePath, this.options.public)
    , relativeRequestedPath = req.path.replace(/^\//i, '')
    , requestedPath = path.resolve(publicDir, relativeRequestedPath)

  // Find out whether this is a file that we are supposed
  // to compile
  var assetType, assetConfig
    , assetPublicPath, assetSourcePath
    , assetCompiler
    , requestedFileIsCompilable = false
  for(var i = 0; i < assetTypes.length; i++) {
    assetType       = assetTypes[i]
    assetConfig     = this.options[assetType]
    assetCompiler   = this.compilers[assetConfig.compiler]
    assetPublicPath = path.resolve(publicDir, assetConfig.destination)

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
      )

      break;
    }
  }

  if(!requestedFileIsCompilable)
    return next();

  this.serveOrCompileAsset(requestedPath, assetSourcePath, assetCompiler, next)
}

acetic.prototype.serveOrCompileAsset = function(destinationPath, sourcePath, compiler, next) {
  var destinationModifiedDate = this.getModifiedDate(destinationPath)
    , sourceModifiedDate      = this.getModifiedDate(sourcePath)
  if (sourceModifiedDate > destinationModifiedDate || !this.options.checkModifiedDate) {
    var options = {
      source: sourcePath,
      destination: destinationPath
    }

    compiler.compile(this, options, function (err) {
      if(err) throw err

      next()
    })
  } else {
    next()
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
      , publicAssetPath = assetConfig.destination

    if(typeof arguments[0] === "string") {
      files = Array.prototype.slice.call(arguments);
    } else if(arguments[0] instanceof Array) {
      files = arguments[0];
    }

    // Resolve the given filenames to multiple files in case
    // they are mentioned in the `files` configuration value
    if(self.options.resolveFiles) {
      var file
      for(var i = 0; i < files.length; i++) {
        file = files[i]
        if (assetFiles[file] instanceof Array) {
          finalFiles = finalFiles.concat(assetFiles[file])
        } else {
          finalFiles.push(file)
        }
      }
    } else {
      finalFiles = files
    }

    finalFiles.forEach(function (file) {
      var filePath;
      if (/^https?/i.test(file))
        filePath = file;
      else
        filePath = "/" + publicAssetPath + "/" + file;

      switch(assetType) {
        case "javascripts":
          content += "<script src=\"" + filePath + "\"></script>"
          break;
        case "stylesheets":
          content += "<link rel=\"stylesheet\" href=\"" + filePath + "\" />";
          break;
      }
    });

    return content;
  };
};

/*
 * Return the last modification date for the given path
 */
acetic.prototype.getModifiedDate = function (filePath) {
  try {
    var stat = fs.statSync(filePath);
    return stat.mtime;
  } catch (e) {
    return 0;
  }
};

module.exports = acetic;
