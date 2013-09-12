var compilers = require('./compilers');

function Precompiler(options) {
  this.options    = options;
  this.assetTypes = ['javascripts', 'stylesheets'];
  this.compilers  = compilers;
}

/**
 * Precompiles the assets given by the configuration
 */
Precompiler.prototype.run = function(callback) {
  var self = this;
  callback();
};

module.exports = Precompiler;
