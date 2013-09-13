var exec = require('child_process').exec
  , stdout, stderr;

describe('Command line interface', function () {
  describe('with precompile command', function (done) {
    before(function (done) {
      var p = exec('../../bin/acetic precompile -c config/acetic.yml', {
        cwd: __dirname + '/app'
      }, function (e, out, err) {
        stdout = out;
        stderr = err;

        done();
      });
    });

    it('should properly precompile coffeescript files', function (done) {
      expectFileEquality(
        __dirname + '/app/public/assets/javascripts/some-file.js',
        __dirname + '/fixtures/precompile/coffee/some-file.js'
      );
      expectFileEquality(
        __dirname + '/app/public/assets/javascripts/some-other-file.js',
        __dirname + '/fixtures/precompile/coffee/some-other-file.js'
      );
      done();
    });

    it('should properly precompile stylus files', function (done) {
      expectFileEquality(
        __dirname + '/app/public/assets/stylesheets/app.css',
        __dirname + '/fixtures/precompile/stylus/app.css'
      );
      expectFileEquality(
        __dirname + '/app/public/assets/stylesheets/sites/index.css',
        __dirname + '/fixtures/precompile/stylus/sites/index.css'
      );
      done();
    });
  });
});
