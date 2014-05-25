var async      = require('async')
  , compilers  = require('./compilers')
  , utils      = require('./utils')
  , compressor = require('yuicompressor')
  , fs         = require('fs')
  , path       = require('path');

function Processor(options) {
  this.options   = options;
  this.compilers = compilers;
}

/**
 * Processes the files given by an Array containing
 * objects with `sources` and `destination` properties
 *
 * @param  {String} assetType
 * @param  {Array} files
 * @param  {Function} callback
 */
Processor.prototype.processFiles = function(assetType, files, callback) {
  var self = this;
  async.eachSeries(files, function (file, callback) {
    self.processFile(assetType, file, callback);
  }, callback);
};

/**
 * Processes the given file by an object containing
 * a `sources` and a `destination` property
 * @param  {String}   assetType
 * @param  {Object}   file
 * @param  {Function} callback
 */
Processor.prototype.processFile = function(assetType, file, callback) {
  var self = this;

  async.waterfall([
    function compile(callback) {
      self.compileFiles(file.sources, assetType, callback);
    },
    function minify(data, callback) {
      self.minifyData(data, assetType, callback);
    }
  ], function (err, data) {
    if (err) return callback(err);

    // Kids, newlines at the end of files are important!
    if (!data.match(/\n$/i))
      data += '\n';

    utils.ensurePathExists(path.dirname(file.destination), '/');
    fs.writeFileSync(file.destination, data);

    callback(null);
  });
};

/**
 * Compiles the given array of file paths
 * @param  {Array}    files
 * @param  {String}   assetType
 * @param  {Function} callback
 */
Processor.prototype.compileFiles = function(files, assetType, callback) {
  var assetOptions  = this.options.assets[assetType]
    , assetCompiler = this.compilers[assetOptions.compiler]
    , data = [];

  async.each(files, function (file, callback) {
    assetCompiler.compile({ source: file }, function (err, compiled) {
      if (err) return callback(err);

      data.push(compiled);
      callback(null);
    });
  }, function (err) {
    if (err) return callback(err);

    callback(null, data.join('\n'));
  });
};

/**
 * Minifies the given data
 * @param  {String}   data
 * @param  {String}   assetType
 * @param  {Function} callback
 */
Processor.prototype.minifyData = function(data, assetType, callback) {
  var assetOptions  = this.options.assets[assetType]
    , assetCompiler = this.compilers[assetOptions.compiler]
    , assetTypeShort;

  // Do we want to minify?
  if (!assetOptions.minify)
    return callback(null, data);

  switch (assetType) {
    case 'javascripts':
      assetTypeShort = 'js';
      break;
    case 'stylesheets':
      assetTypeShort = 'css';
      break;
  }

  compressor.compress(data, {
    charset: 'utf8',
    type: assetTypeShort
  }, function (err, data, extra) {
    if (err) return callback(err);

    callback(null, data);
  });
};

module.exports = Processor;
