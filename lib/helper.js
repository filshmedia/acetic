function Helper(options) {
  this.options = options;
}

/**
 * Defines the asset helpers
 * @param  {String} assetType
 * @return {Function}
 */
Helper.prototype.use = function(assetType) {
  var assetConfig = this.options[assetType]
    , assetFiles  = assetConfig.files
    , self = this;
  return function () {
    var files = [], finalFiles = []
      , content = ""
      , publicAssetPath = assetConfig.destination;

    if(typeof arguments[0] === "string") {
      files = Array.prototype.slice.call(arguments);
    } else if(arguments[0] instanceof Array) {
      files = arguments[0];
    }

    // Resolve the given filenames to multiple files in case
    // they are mentioned in the `files` configuration value
    // if(self.options.resolveFiles) {
    //   var file;
    //   for(var i = 0; i < files.length; i++) {
    //     file = files[i]
    //     if (assetFiles[file] instanceof Array) {
    //       finalFiles = finalFiles.concat(assetFiles[file]);
    //     } else {
    //       finalFiles.push(file);
    //     }
    //   }
    // } else {
      finalFiles = files;
    // }

    finalFiles.forEach(function (file) {
      var filePath;
      if (/^https?/i.test(file)) {
        filePath = file;
      } else {
        filePath = "/" + publicAssetPath + "/" + file;
        if (self.options.cdn) {
          filePath = self.options.cdn + filePath;
        }
      }

      switch(assetType) {
        case "javascripts":
          content += "<script src=\"" + filePath + "\"></script>";
          break;
        case "stylesheets":
          content += "<link rel=\"stylesheet\" href=\"" + filePath + "\" />";
          break;
      }
    });

    return content;
  };
};

module.exports = Helper;
