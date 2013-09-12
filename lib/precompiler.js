var compilers = require('./compilers')
  , async     = require('async')
  , path      = require('path')
  , Processor = require('./processor');

function Precompiler(options) {
  this.options    = options;
  this.assetTypes = ['javascripts', 'stylesheets'];
  this.compilers  = compilers;
  this.processor  = new Processor(this.options);
}

/**
 * Precompiles the assets given by the configuration
 */
Precompiler.prototype.run = function(callback) {
  var self = this;
  async.each(this.assetTypes, function(assetType, callback) {
    self.handleAssetType(assetType, callback);
  }, callback);
};

/**
 * Handles the precompilation of the given asset type
 * @param  {String} assetType
 * @param  {Function} callback
 */
Precompiler.prototype.handleAssetType = function(assetType, callback) {
  var assetConfig = this.options[assetType]
    , sourcePath = path.resolve(this.options.relativePath, assetConfig.source)
    , destinationPath = path.resolve(this.options.relativePath, this.options.public, assetConfig.destination)
    , compiler = this.compilers[assetConfig.compiler];

  var files = [];
  for(var i = 0; i < assetConfig.files.length; i++) {
    var filename        = assetConfig.files[i]
      , sourcePath      = path.resolve(sourcePath, filename)
      , destinationPath = path.resolve(destinationPath, filename);

    // Replace source extension with destination extension
    var baseDestinationFile = destinationPath.substr(0, destinationPath.lastIndexOf('.'));
    destinationPath = baseDestinationFile + '.' + compiler.destinationExtension;

    files.push({
      sources: [sourcePath],
      destination: destinationPath
    });
  }

  // Process the files and call the callback when it's done
  this.processor.processFiles(assetType, files, callback)
};

module.exports = Precompiler;
