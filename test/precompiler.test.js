var exec = require('child_process').exec
  , fs = require('fs');

function precompile(callback) {
  var command = 'cd ' + __dirname + ' && ../bin/acetic precompile'
    , p = exec(command);

  p.stdout.pipe(process.stdout);
  p.stderr.pipe(process.stderr);

  p.on('exit', function (errorCode, signal) {
    errorCode.should.equal(0);
    callback(null);
  })
}

function clearAssets(callback) {
  ['js', 'css'].forEach(function (assetType) {
    var path = __dirname + '/app/public/assets/' + assetType
      , files = fs.readdirSync(path);

    files.forEach(function (file) {
      if (file.match(/^\./i)) return;
      if (!fs.statSync(path + '/' + file).isFile()) return;

      fs.unlinkSync(path + '/' + file);
    })
  });

  callback();
}

before(function (done) {
  clearAssets(function () {
    precompile(done);
  });
});

describe('Precompiler', function () {
  it('should correctly precompile and minify javascripts', function (done) {
    var precompilejs = fs.readFileSync( __dirname + '/app/public/assets/js/minify.js')
      , expectedJavascript = '';

    precompilejs.toString().should.equal(expectedJavascript);
    done();
  });

  it('should correctly precompile, concatenate and minify javascripts', function (done) {
    var precompilejs = fs.readFileSync( __dirname + '/app/public/assets/js/precompile.js')
      , expectedJavascript = '';

    precompilejs.toString().should.equal(expectedJavascript);
    done();
  });
});
