'use strict';

var Helper = require('./helper');
var compilers = require('./compilers');
var path = require('path');
var utils = require('./utils');
var fs = require('fs');

function Middleware(options) {
  this.options   = options;
  this.helper    = new Helper(this.options);
  this.compilers = compilers;
}

/**
 * Add jsAsset and cssAsset helpers to the response locals
 * @param  {HTTP.ServerResponse} res
 * @private
 */
Middleware.prototype._attachAssetHelpers = function (res) {
  res.locals.jsAsset  = this.helper.use('javascripts');
  res.locals.cssAsset = this.helper.use('stylesheets');
};

/**
 * The connect / express middleware
 * @param  {HTTP.ClientRequest}   req
 * @param  {HTTP.ServerResponse}   res
 * @param  {Function} next
 */
Middleware.prototype.init = function (req, res, next) {
  var assetTypes = ['javascripts', 'stylesheets'];
  var self = this;

  // Attach our asset helpers
  this._attachAssetHelpers(res);

  // Skip middleware if we are not supposed to compile
  // assets at all
  if(!this.options.compile)
    return next();

  // Iterate over all available asset types
  for (var i = 0; i < assetTypes.length; i++) {
    var assetType = assetTypes[i];

    // The configuration for this asset (entered by the user)
    var assetConfig = self.options[assetType];

    // The compiler responsible for this kind of assets (selected by the user)
    var assetCompiler = self.compilers[assetConfig.compiler];

    // The general public path where all public assets are located
    var publicPath = path.resolve(this.options.relativePath, this.options.public);

    // The public path where the compiled files will be stored in
    var assetPublicPath = path.resolve(publicPath, assetConfig.destination);

    // Check whether the requested path lies inside our public path.
    var requestedPath = path.resolve(publicPath, req.path.replace(/^\//i, ''));
    if (requestedPath.indexOf(assetPublicPath) === -1) {
      continue;
    }

    var sourcePath = path.resolve(this.options.relativePath, assetConfig.source);
    sourcePath = requestedPath.replace(assetPublicPath, sourcePath);

    // Check whether the file extension of the requested file
    // fits the extensions that the asset compiler is responsible for.
    var requestedFileExtension = requestedPath.split('.').pop().toLowerCase();
    var compilerDestinationExtension = assetCompiler.destinationExtension.toLowerCase();
    if (requestedFileExtension !== compilerDestinationExtension) {
      console.log(requestedFileExtension, compilerDestinationExtension);
      return this._copyAndServeAsset(sourcePath, requestedPath, next);
    }

    // Iterate over possible source files and check whether they exist
    var sourceExists = false;
    var assetSourcePath;

    for (var j = 0; j < assetCompiler.sourceExtensions.length; j++) {
      var extension = assetCompiler.sourceExtensions[j];

      // Build the source path
      assetSourcePath = sourcePath.replace(
        new RegExp('\.' + assetCompiler.destinationExtension + '$'),
        '.' + extension
      );

      if (fs.existsSync(assetSourcePath)) {
        sourceExists = true;
        break;
      }
    }

    if (!sourceExists) {
      return this._copyAndServeAsset(sourcePath, requestedPath, next);
    } else {
      // If a source file exists, compile it and serve it using the
      // static middleware afterwards
      return this._serveOrCompileAsset(requestedPath, assetSourcePath, assetCompiler, next);
    }
  }

  next();
};

Middleware.prototype._serveOrCompileAsset = function(destinationPath, sourcePath, compiler, next) {
  var destinationModifiedDate = utils.getModifiedDate(destinationPath);
  var sourceModifiedDate = utils.getModifiedDate(sourcePath);

  if (!fs.existsSync(sourcePath)) {
    return next();
  }

  if (sourceModifiedDate > destinationModifiedDate || !this.options.checkModifiedDate) {
    var options = {
      source: sourcePath,
      destination: destinationPath
    };

    compiler.compile(options, function (err) {
      if(err) throw err;

      next();
    });
  } else {
    next();
  }
};

Middleware.prototype._copyAndServeAsset = function(sourcePath, destinationPath, next) {
  // If no source file exists, check whether a file with the source
  // extension exists inside the assets path
  if (fs.existsSync(sourcePath)) {
    // If it does, copy it to the requested path
    return utils.copyFile(sourcePath, destinationPath, true, function () {
      // Try to serve it using the static middleware
      next();
    });
  } else {
    // Try to serve it using the static middleware
    return next();
  }
};

module.exports = Middleware;
