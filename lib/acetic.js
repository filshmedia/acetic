/**
 * acetic
 * simple yet powerful asset compilation engine for express 3.x
 *
 * @author Sascha Gehlich <sascha@gehlich.us>
 * @license MIT
 */
var path   = require("path")
  , fs     = require("fs")
  , colors = require("colors")

function acetic(options) {
  this.options = options;

  // Debug output when compiling
  if(!this.options.debug) this.options.debug = true;

  // Should we check the modified date before compiling?
  if(!this.options.checkModifiedDate) this.options.checkModifiedDate = true;

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
  // Attach our asset helpers
  this.attachAssetHelpers(res);

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
    if (!exists || (self.getModifiedDate(sourcePath) > self.getModifiedDate(destinationPath) || !self.options.checkModifiedDate)) {
      responsibleCompiler.compile(self, {
        source: sourcePath,
        destination: destinationPath,
        assetsPath: self.options.assetsPath
      }, function (err, options) {
        if (err) throw err;

        if (self.options.debug) {
          var source = self.options[responsibleCompiler.key + "SourceDirectory"] + "/" + destinationRelativePath
            , destination = destinationPath.replace(publicAssetsPath + "/", "")
          self.log("Compiled ".grey + source.blue.bold + " to ".grey + destination.blue.bold)
        }

        next();
      });
    } else {
      next();
    }
  });
};

/*
 * Attach asset helpers to locals
 */
acetic.prototype.attachAssetHelpers = function (res) {
  res.locals.js_asset =
    res.locals.jsAsset =
    res.locals.js_assets =
    res.locals.jsAssets = this.helper("js");

  res.locals.css_asset =
    res.locals.cssAsset =
    res.locals.css_assets =
    res.locals.cssAssets = this.helper("css");
}

/*
 * Build a helper for the given asset type
 */
acetic.prototype.helper = function (assetType) {
  var self = this;
  return function () {
    var files = []
      , content = "";

    if(typeof arguments[0] === "string") {
      files = Array.prototype.slice.call(arguments);
    } else if(arguments[0] instanceof Array) {
      files = arguments[0];
    }

    files.forEach(function (file) {
      var filePath;
      if (/^https?/i.test(file))
        filePath = file;
      else
        filePath = "/" + self.options.publicAssetsPath + "/" + self.options[assetType + "Directory"] + "/" + file;

      switch(assetType) {
        case "js":
          content += "<script src=\"" + filePath + "\"></script>"
          break;
        case "css":
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
