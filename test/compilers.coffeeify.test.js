var fs = require('fs')
  , supertest = require('supertest');

var app
  , testSourceFile = __dirname + '/app/assets/javascripts/coffeeify.test.coffee'
  , testDestinationFile = __dirname + '/app/public/assets/javascripts/coffeeify.test.js'
  , testDestinationPath = '/assets/javascripts/coffeeify.test.js';

describe('coffeeify compiler', function () {
  before(function () {
    app = mockServer({
      javascripts: { compiler: 'coffeeify' },
      public: 'app/public'
    });
  });

  after(function () {
    app.server.close();
  });

  it('should properly compile and browserify coffeescript files to javascript', function (done) {
    if (fs.existsSync(testDestinationFile))
      fs.unlinkSync(testDestinationFile);

    var expectedContent = fs.readFileSync(__dirname + '/fixtures/coffeeify.test.js').toString();

    supertest(app.server)
      .get(testDestinationPath)
      .expect(expectedContent)
      .end(done);
  });

  describe('if minify is enabled', function () {
    before(function () {
      app.server.close();
      app = mockServer({
        javascripts: { compiler: 'coffeeify', minify: true },
        public: 'app/public'
      });
    });

    it('should properly minify the compiled javascript', function (done) {
      if (fs.existsSync(testDestinationFile))
        fs.unlinkSync(testDestinationFile);

      var expectedContent = fs.readFileSync(__dirname + '/fixtures/coffeeify.test.min.js').toString();

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
          compiler: 'coffeeify',
          files: {
            'coffeeify.concatenate.js': [
              'coffeeify.concatenate.1.js',
              'coffeeify.concatenate.2.js'
            ]
          }
        },
        public: 'app/public'
      });
    });

    it('should properly concatenate the compiled javascripts', function (done) {
      testDestinationFile = __dirname + '/app/public/assets/javascripts/coffeeify.concatenated.js'
      testDestinationPath = '/assets/javascripts/coffeeify.concatenated.js';

      if (fs.existsSync(testDestinationFile))
        fs.unlinkSync(testDestinationFile);

      var expectedContent = fs.readFileSync(__dirname + '/fixtures/coffeeify.test.concatenated.js').toString();

      supertest(app.server)
        .get(testDestinationPath)
        .expect(expectedContent)
        .end(done);
    });
  });
});
