var fs = require('fs')
  , options = {
    javascripts: {},
    stylesheets: {},
    public: 'app/public'
  };

describe('Precompiler', function() {
  describe('per default', function () {
    before(function (done) {
      options.javascripts.files = [
        'coffee.test.coffee'
      ];
      options.stylesheets.files = [
        'stylus.test.styl'
      ];
      runPrecompiler(options, done);
    });

    it('should properly compile coffeescript files to javascript', function (done) {
      expectFileEquality(
        __dirname + '/app/public/assets/javascripts/coffee.test.js',
        __dirname + '/fixtures/coffee/coffee.test.js'
      );
      done();
    });

    it('should properly compile stylus files to css', function (done) {
      expectFileEquality(
        __dirname + '/app/public/assets/stylesheets/stylus.test.css',
        __dirname + '/fixtures/stylus/stylus.test.css'
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
      options.stylesheets.minify = true;
      options.stylesheets.files = [
        'stylus.test.styl'
      ];
      runPrecompiler(options, done);
    });

    it('should properly minify the compiled javascripts', function (done) {
      expectFileEquality(
        __dirname + '/app/public/assets/javascripts/coffee.test.js',
        __dirname + '/fixtures/coffee/coffee.test.minify.js'
      );
      done();
    });

    it('should properly minify the compiled stylesheets', function (done) {
      expectFileEquality(
        __dirname + '/app/public/assets/stylesheets/stylus.test.css',
        __dirname + '/fixtures/stylus/stylus.test.minify.css'
      );
      done();
    });
  });
});
