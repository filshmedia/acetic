var async      = require('async')
  , path       = require('path')
  , fs         = require('fs')
  , compilers  = require('../compilers')
  , browserify = require('browserify')
  , minify     = require('node-minify');

function Precompile(options) {
  this.options    = options;
  this.assetTypes = ['javascripts', 'stylesheets'];
  this.compilers  = compilers;
}

/**
 * Precompiles the assets given by the configuration
 */
Precompile.prototype.run = function() {
  var self = this;
  async.eachSeries(this.assetTypes, function (assetType, callback) {
    self.handleAssetType(assetType, callback);
  }, function (err) {
    if (err) throw err;
    process.exit(0);
  });
};

/**
 * Handles the precompilation for the given asset type
 * @param  {String}   assetType
 * @param  {Function} callback
 */
Precompile.prototype.handleAssetType = function(assetType, callback) {
  var assetOptions = this.options[assetType]
    , files = assetOptions.files
    , self  = this
    , steps = ['compile', 'concatenate', 'browserify', 'minify'];

  if (Object.keys(files).length === 0)
    return callback(null);

  async.eachSeries(steps, function (step, callback) {
    self[step + 'Files'](assetType, files, callback);
  }, function (err) {
    callback(err);
  })
};

/**
 * Finds the files it should compile and compiles them
 * @param  {String}   assetType
 * @param  {Array}    files
 * @param  {Function} callback
 */
Precompile.prototype.compileFiles = function(assetType, files, callback) {
  var compilableFiles = []
    , self = this;

  // Collect files that we should try to compile
  for(var filename in files) {
    if (files[filename] === true) {
      compilableFiles.push(filename);
    } else {
      compilableFiles = compilableFiles.concat(files[filename]);
    }
  }

  async.eachSeries(compilableFiles, function (file, callback) {
    self.compile(assetType, file, callback);
  }, callback);
};

/**
 * Tries to compile the given asset
 * @param  {String}   assetType
 * @param  {String}   filename
 * @param  {Function} callback
 */
Precompile.prototype.compile = function(assetType, filename, callback) {
  var assetOptions, destinationPath, sourceFilename, sourcePath, compiler;

  assetOptions = this.options[assetType];
  compiler     = this.compilers[assetOptions.compiler];
  destinationPath = path.resolve(
    this.options.relativePath, this.options.public,
    assetOptions.destination, filename
  );
  sourceFilename = filename.replace(
    new RegExp('\.' + compiler.destinationExtension + '$'),
    '.' + compiler.sourceExtension
  );
  sourcePath = path.resolve(
    this.options.relativePath, assetOptions.source, sourceFilename
  );

  if (fs.existsSync(sourcePath)) {
    var options = {
      source: sourcePath,
      destination: destinationPath
    };
    compiler.compile(options, callback);
  } else {
    callback(null);
  }
};

/**
 * Concatenates files
 * @param  {String}   assetType
 * @param  {Object}   files
 * @param  {Function} callback
 */
Precompile.prototype.concatenateFiles = function(assetType, files, callback) {
  var self = this
    , assetOptions = this.options[assetType];

  for (var filename in files) {
    if (files[filename] === true) continue;

    if (files[filename] instanceof Array) {
      var destinationPath = path.resolve(
        this.options.relativePath, this.options.public,
        assetOptions.destination, filename
      );

      // Get concatenated file content
      var out = files[filename].map(function (file) {
        var filePath = path.resolve(
          self.options.relativePath, self.options.public,
          assetOptions.destination, file
        );
        return fs.readFileSync(filePath);
      });

      fs.writeFileSync(destinationPath, out.join('\n'));
    }
  }

  callback(null);
};

/**
 * Minifies the given files
 * @param  {String}   assetType
 * @param  {Object}   files
 * @param  {Function} callback
 */
Precompile.prototype.minifyFiles = function(assetType, files, callback) {
  var affectedFiles = Object.keys(files)
    , self = this;

  async.eachSeries(affectedFiles, function (file, callback) {
    self.minify(assetType, file, callback);
  }, function (err) {
    callback(err);
  });
};

/**
 * Minifies the given file
 * @param  {String}   file
 * @param  {Function} callback
 */
Precompile.prototype.minify = function(assetType, file, callback) {
  var assetOptions = this.options[assetType]
    , filePath = path.resolve(
      this.options.relativePath, this.options.public,
      assetOptions.destination, file
    )
    , compilerOptions = this.compilers[assetOptions.compiler];

  new minify.minify({
    type: compilerOptions.minifyMethod,
    fileIn: filePath,
    fileOut: filePath,
    buffer: 1000 * 1024,
    callback: callback
  });
};

module.exports = Precompile;
