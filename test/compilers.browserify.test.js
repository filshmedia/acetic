var fs = require('fs')
  , supertest = require('supertest');

var app
  , testSourceFile = __dirname + '/app/assets/javascripts/browserify.test.coffee'
  , testDestinationFile = __dirname + '/app/public/assets/javascripts/coffeeifybrowserify.test.js'
  , testDestinationPath = '/assets/javascripts/browserify.test.js';

describe.only('browserify compiler', function () {
  before(function () {
    app = mockServer({
      javascripts: { compiler: 'coffee' },
      public: 'app/public'
    });
  });

  after(function () {
    app.server.close();
  });

  it('should properly browserify javascript files to javascript', function (done) {
    if (fs.existsSync(testDestinationFile))
      fs.unlinkSync(testDestinationFile);

    var expectedContent = fs.readFileSync(__dirname + '/fixtures/browserify.test.js').toString();

    supertest(app.server)
      .get(testDestinationPath)
      .expect(expectedContent)
      .end(done);
  });

  describe('if minify is enabled', function () {
    before(function () {
      app.server.close();
      app = mockServer({
        javascripts: { compiler: 'browserify', minify: true },
        public: 'app/public'
      });
    });

    it('should properly minify the compiled javascript', function (done) {
      if (fs.existsSync(testDestinationFile))
        fs.unlinkSync(testDestinationFile);

      var expectedContent = fs.readFileSync(__dirname + '/fixtures/browserify.test.min.js').toString();

      supertest(app.server)
        .get(testDestinationPath)
        .expect(expectedContent)
        .end(done);
    });
  });
  describe('if concatenate is enabled', function () {
    before(function () {
      app.server.close();
      app = mockServer({
        javascripts: {
          compiler: 'browserify',
          files: {
            'browserify.concatenate.js': [
              'browserify.concatenate.1.js',
              'browserify.concatenate.2.js'
            ]
          }
        },
        public: 'app/public'
      });
    });

    it('should properly concatenate the compiled javascripts', function (done) {
      testDestinationFile = __dirname + '/app/public/assets/javascripts/browserify.concatenated.js'
      testDestinationPath = '/assets/javascripts/browserify.concatenated.js';

      if (fs.existsSync(testDestinationFile))
        fs.unlinkSync(testDestinationFile);

      var expectedContent = fs.readFileSync(__dirname + '/fixtures/browserify.test.concatenated.js').toString();

      supertest(app.server)
        .get(testDestinationPath)
        .expect(expectedContent)
        .end(done);
    });
  });
});
