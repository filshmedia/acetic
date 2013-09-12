var fs = require("fs")
  , errorCSSStyles = [
    'display: block;',
    'white-space: pre;',
    'font-family: monospace;',
    'background: rgba(0, 0, 0, 0.1);',
    'padding: 10px;',
    'margin: auto;',
    'border-radius: 3px;',
    'border: 2px solid red;'
  ].join('');

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


/**
 * Creates a JavaScript that writes a compilation error
 * to the page where it has been included
 * @param  {Object} options
 * @return {String}
 */
function createErrorJavascript(options) {
  var content = [
    'acetic compilation error',
    '',
    options.filePath + ':' + options.line
  ], lines = options.fileContent.split('\n');

  var lineStart = Math.max(0, options.line - 3)
    , lineEnd   = options.line + 3;

  for(var i = lineStart; i < lineEnd; i++) {
    content.push(
        (i === options.line ? '> ': '  ')
      + new Array(lineEnd.toString().length - i.toString().length).join(' ')
      + (i + 1)
      + '| '
      + lines[i]
    );
  }

  content.push('');
  content.push(options.message);

  content = content.join('\\n').replace(/\"/ig, "\\\"");

  return [
    'document.write("',
      '<div style=\\\"', errorCSSStyles, '\\\">',
        content,
      '</div>',
    '");\n'
  ].join('');
}
exports.createErrorJavascript = createErrorJavascript;

/**
 * Creates a CSS that writes a compilation error
 * to the page where it has been included
 * @param  {Object} options
 * @return {String}
 */
function createErrorCSS(options) {
  var message = options.message;
  message = 'acetic compilation error\n\n' + message;
  message = message
    .replace(/\n/ig, '\\00000a')
    .replace(/\"/ig, '\\"');

  return [
    'body:before {',
      errorCSSStyles,
      'content: "', message, '";',
    '}\n'
  ].join('');
}
exports.createErrorCSS = createErrorCSS;
