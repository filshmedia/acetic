var Helper     = require('./helper')
  , compilers  = require('./compilers')
  , path       = require('path')
  , utils      = require('./utils');

function Middleware(options) {
  this.options   = options;
  this.helper    = new Helper(this.options);
  this.compilers = compilers;
}

/*
 * Attach asset helpers to locals
 */
Middleware.prototype.attachAssetHelpers = function (res) {
  var self = this;
  res.locals.jsAsset  = this.helper.use('javascripts');
  res.locals.cssAsset = this.helper.use('stylesheets');
}

/*
 * The connect / express middleware
 */
Middleware.prototype.middleware = function (req, res, next) {
  var assetTypes = ['javascripts', 'stylesheets'];

  // Attach our asset helpers
  this.attachAssetHelpers(res);

  // Skip middleware if we are not supposed to compile
  // assets at all
  if(!this.options.compileAssets)
    return next();

  // Build the absolute requested path
  var publicDir = path.resolve(this.options.relativePath, this.options.public)
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
      var sourceDir = path.resolve(this.options.relativePath, assetConfig.source)
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

Middleware.prototype.serveOrCompileAsset = function(destinationPath, sourcePath, compiler, next) {
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
module.exports = Middleware;
