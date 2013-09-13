var Precompiler = require('../precompiler');

function Precompile(options) {
  this.options     = options;
  this.precompiler = new Precompiler(this.options);
}

/**
 * Runs the precompiler
 * @param  {Function} callback
 */
Precompile.prototype.run = function(callback) {
  this.precompiler.run(callback);
};

module.exports = Precompile;
