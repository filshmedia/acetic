var fs = require('fs')
  , options = {
    javascripts: {},
    public: 'app/public'
  };

describe('Precompiler', function() {
  beforeEach(function () {
    cleanDirectory(__dirname + '/app/public/assets/javascripts', 'js');
    cleanDirectory(__dirname + '/app/public/assets/stylesheets', 'css');
  })

  before(function (done) {
    options.javascripts.files = {
      'coffee.test.coffee': true
    };
    runPrecompiler(options, done);
  });

  it('should properly compile coffeescript files to javascript', function (done) {
    expectFileEquality(
      __dirname + '/app/public/assets/javascripts/coffee.test.js',
      __dirname + '/fixtures/coffee.test.js'
    );
    done();
  });

  describe('if minify is enabled', function () {
    before(function (done) {
      options.javascripts.minify = true;
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

  describe('if concatenate is enabled', function () {
    before(function (done) {
      options.javascripts.concatenate = true;
      options.javascripts.minify = true;
      options.javascripts.files = {
        'coffee.test.concatenate.coffee': [
          'coffee.test.concatenate.1.coffee',
          'coffee.test.concatenate.2.coffee'
        ]
      };
      runPrecompiler(options, done);
    });

    it('should properly concatenate the compiled javascripts', function (done) {
      expectFileEquality(
        __dirname + '/app/public/assets/javascripts/coffee.test.concatenate.js',
        __dirname + '/fixtures/coffee.test.concatenate.js'
      );
      done();
    });
  });
});
