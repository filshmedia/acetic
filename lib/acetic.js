/**
 * acetic
 * simple yet powerful asset compilation engine for express 3.x
 *
 * @author Sascha Gehlich <sascha@gehlich.us>
 * @license MIT
 */
var path = require("path")
  , fs   = require("fs");

function acetic(options) {
  this.options = options;

  // Should we compile the assets?
  if(!this.options.compileAssets) this.options.compileAssets = true;

  // Public path
  if(!this.options.publicPath) this.options.publicPath = "public";

  // Public asset path where the compiled files will be stored
  // (relative to publicPath)
  if(!this.options.publicAssetsPath) this.options.publicAssetsPath = "assets";

  // Public asset directory names
  if(!this.options.jsDirectory) this.options.jsDirectory = "js";
  if(!this.options.cssDirectory) this.options.cssDirectory = "css";

  // Asset path where the source files are in
  if(!this.options.assetsPath) this.options.assetsPath = "assets";

  // Asset source directory names
  if(!this.options.jsSourceDirectory) this.options.jsSourceDirectory = "coffeescripts";
  if(!this.options.cssSourceDirectory) this.options.cssSourceDirectory = "stylus";

  this.compilers = require("./compilers");

  // Do some scope magic, we want `this` inside our
  // middleware to be the `acetic` instance
  var self = this;
  return function () {
    self.middleware.apply(self, arguments);
  };
};

/*
 * The connect / express middleware
 */
acetic.prototype.middleware = function (req, res, next) {
  // Skip middleware if we are not supposed to compile
  // assets at all
  if(!this.options.compileAssets)
    return next();

  // Build the absolute path
  var absoluteRequestPath = path.resolve(this.options.publicPath, req.path.slice(1))
    , publicAssetsPath    = path.resolve(this.options.publicPath, this.options.publicAssetsPath);

  // Does the absolute path of the requested file begin
  // with our public assets path? If no, skip the middleware
  if (!new RegExp("^" + publicAssetsPath).test(absoluteRequestPath))
    return next();

  // What subfolder is the requested file in?
  var relativeAssetPath = absoluteRequestPath.replace(new RegExp("^" + publicAssetsPath + "/"), "");

  // Find the responsible compiler
  var compiler, responsibleCompiler;
  for(var key in this.compilers) {
    compiler = this.compilers[key];

    // Is this the output directory of the given compiler?
    if (new RegExp("^" + this.options[key + "Directory"] + "/").test(relativeAssetPath)) {
      responsibleCompiler = compiler;
      responsibleCompiler.key = key;
      break;
    }
  }
  if (!responsibleCompiler) return next();

  // Find destination filename
  var destinationRelativePath = relativeAssetPath.replace(new RegExp("^" + this.options[key + "Directory"] + "/"), "");
  destinationRelativePath = destinationRelativePath.replace(new RegExp("." + responsibleCompiler.destinationExtension), "." + responsibleCompiler.sourceExtension);

  // Build the source and destination paths
  var destinationPath = absoluteRequestPath
    , sourcePath = path.resolve(this.options.assetsPath, this.options[responsibleCompiler.key + "SourceDirectory"], destinationRelativePath);

  // Check whether we have to compile
  var self = this;
  fs.exists(destinationPath, function (exists) {
    // Compile if the destination file is missing or
    // source path is newer than the destination
    if (!exists || self.getModifiedDate(sourcePath) > self.getModifiedDate(destinationPath)) {
      responsibleCompiler.compile({ source: sourcePath, destination: destinationPath }, function (err) {
        if (err) throw err;

        next();
      });
    } else {
      next();
    }
  });
};

/*
 * Return the last modification date for the given path
 */
acetic.prototype.getModifiedDate = function (filePath) {
  var stat = fs.statSync(filePath);
  return stat.mtime;
};

module.exports = acetic;
