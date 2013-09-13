var fs = require('fs')
  , options = {
    javascripts: {},
    stylesheets: {},
    public: 'app/public'
  };

describe('Precompiler', function() {
  describe('using coffee compiler', function () {
    describe('if minify is disabled', function () {
      before(function (done) {
        options.javascripts.minify = false;
        options.javascripts.files = [
          'coffee/coffee.test.coffee'
        ];
        runPrecompiler(options, done);
      });

      it('should properly compile coffeescript files to javascript', function (done) {
        expectFileEquality(
          __dirname + '/app/public/assets/javascripts/coffee/coffee.test.js',
          __dirname + '/fixtures/coffee/coffee.test.js'
        );
        done();
      });
    });

    describe('if minify is enabled', function () {
      before(function (done) {
        options.javascripts.minify = true;
        runPrecompiler(options, done);
      });

      it('should properly compile and minify coffeescript files to javascript', function (done) {
        expectFileEquality(
          __dirname + '/app/public/assets/javascripts/coffee/coffee.test.js',
          __dirname + '/fixtures/coffee/coffee.test.minify.js'
        );
        done();
      });
    });
  });

  describe('using browserify compiler', function () {
    describe('if minify is disabled', function () {
      before(function (done) {
        options.javascripts.compiler = 'browserify';
        options.javascripts.minify = false;
        options.javascripts.files = [
          'browserify/browserify.test.js'
        ];
        runPrecompiler(options, done);
      });

      it('should properly browserify javascript files', function (done) {
        expectFileEquality(
          __dirname + '/app/public/assets/javascripts/browserify/browserify.test.js',
          __dirname + '/fixtures/browserify/browserify.test.js'
        );
        done();
      });
    });

    describe('if minify is enabled', function () {
      before(function (done) {
        options.javascripts.minify = true;
        runPrecompiler(options, done);
      });

      it('should properly browserify and minify javascript files', function (done) {
        expectFileEquality(
          __dirname + '/app/public/assets/javascripts/browserify/browserify.test.js',
          __dirname + '/fixtures/browserify/browserify.test.minify.js'
        );
        done();
      });
    });
  });

  describe('using coffeeify compiler', function () {
    describe('if minify is disabled', function () {
      before(function (done) {
        options.javascripts.compiler = 'coffeeify';
        options.javascripts.minify = false;
        options.javascripts.files = [
          'coffeeify/coffeeify.test.coffee'
        ];
        runPrecompiler(options, done);
      });

      it('should properly coffeeify javascript files', function (done) {
        expectFileEquality(
          __dirname + '/app/public/assets/javascripts/coffeeify/coffeeify.test.js',
          __dirname + '/fixtures/coffeeify/coffeeify.test.js'
        );
        done();
      });
    });

    describe('if minify is enabled', function () {
      before(function (done) {
        options.javascripts.minify = true;
        runPrecompiler(options, done);
      });

      it('should properly coffeeify and minify javascript files', function (done) {
        expectFileEquality(
          __dirname + '/app/public/assets/javascripts/coffeeify/coffeeify.test.js',
          __dirname + '/fixtures/coffeeify/coffeeify.test.minify.js'
        );
        done();
      });
    });
  });

  describe('using stylus compiler', function () {
    describe('if minify is disabled', function () {
      before(function (done) {
        options.stylesheets.minify = false;
        options.stylesheets.files = [
          'stylus/stylus.test.styl'
        ];
        runPrecompiler(options, done);
      });

      it('should properly compile stylus files to css', function (done) {
        expectFileEquality(
          __dirname + '/app/public/assets/stylesheets/stylus/stylus.test.css',
          __dirname + '/fixtures/stylus/stylus.test.css'
        );
        done();
      });
    });

    describe('if minify is enabled', function () {
      before(function (done) {
        options.stylesheets.minify = true;
        runPrecompiler(options, done);
      });

      it('should properly compile and minify stylus files to css', function (done) {
        expectFileEquality(
          __dirname + '/app/public/assets/stylesheets/stylus/stylus.test.css',
          __dirname + '/fixtures/stylus/stylus.test.minify.css'
        );
        done();
      });
    });
  });
});
