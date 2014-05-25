function Helper(options) {
  this.options = options;
}

/**
 * Defines the asset helpers
 * @param  {String} assetType
 * @return {Function}
 */
Helper.prototype.use = function(assetType) {
  var assetConfig = this.options.assets[assetType]
    , assetFiles  = assetConfig.files
    , self = this;
  return function () {
    var files = [], finalFiles = []
      , attributes = {}
      , content = ""
      , publicAssetPath = assetConfig.destination;

    if(typeof arguments[0] === "string") {
      if(typeof arguments[1] === "string" || typeof arguments[1] === "undefined") {
        files = Array.prototype.slice.call(arguments);
      } else if (typeof arguments[1] === "object") {
        files = [arguments[0]];
        attributes = arguments[1];
      }
    } else if(arguments[0] instanceof Array) {
      files = arguments[0];
      attributes = arguments[1];
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

    var attributesHTML = "";
    if (attributes) {
      for (var key in attributes) {
        attributesHTML += " " + key + "=\"" + attributes[key] + "\"";
      }
    }

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
          content += "<script src=\"" + filePath + "\"" + attributesHTML + "></script>";
          break;
        case "stylesheets":
          content += "<link rel=\"stylesheet\" href=\"" + filePath + "\"" + attributesHTML + " />";
          break;
      }
    });

    return content;
  };
};

module.exports = Helper;
