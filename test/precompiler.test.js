var fs = require('fs')
  , options = {
    javascripts: {},
    public: 'app/public'
  };

describe('Precompiler', function() {
  describe('per default', function () {
    before(function (done) {
      options.javascripts.files = [
        'coffee.test.coffee'
      ];
      runPrecompiler(options, done);
    });

    it('should properly compile coffeescript files to javascript', function (done) {
      expectFileEquality(
        __dirname + '/app/public/assets/javascripts/coffee.test.js',
        __dirname + '/fixtures/coffee.test.js'
      );
      done();
    });
  });

  describe('if minify is enabled', function () {
    before(function (done) {
      options.javascripts.minify = true;
      options.javascripts.files = [
        'coffee.test.coffee'
      ];
      runPrecompiler(options, done);
    });

    it('should properly minify the compiled javascripts', function (done) {
      expectFileEquality(
        __dirname + '/app/public/assets/javascripts/coffee.test.js',
        __dirname + '/fixtures/coffee.test.minify.js'
      );
      done();
    });
  });
});
