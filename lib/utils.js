var fs = require("fs");

function ensurePathExists(directory, root) {
    var dirs = directory.split('/')
        , dir = dirs.shift()
        , root = (root || '') + dir + '/';

    try { fs.mkdirSync(root); }
    catch (e) {
        if(!fs.statSync(root).isDirectory()) throw new Error(e);
    }

    return !dirs.length || ensurePathExists(dirs.join('/'), root);
}
exports.ensurePathExists = ensurePathExists;


/*
 * Return the last modification date for the given path
 */
function getModifiedDate(filePath) {
  try {
    var stat = fs.statSync(filePath);
    return stat.mtime;
  } catch (e) {
    return 0;
  }
}
exports.getModifiedDate = getModifiedDate;


/**
 * Proxy for console.debug
 */
function debug() {
  var args = Array.prototype.slice.call(arguments);
  console.debug.apply(this, ["\x1B[1m\x1B[32macetic\x1B[39m\x1B[22m"].concat(args));
};
exports.debug = debug;
