var fs = require('fs')
  , supertest = require('supertest');

var app
  , testSourceFile = __dirname + '/app/assets/coffeescripts/coffee.test.coffee'
  , testDestinationFile = __dirname + '/app/public/assets/javascripts/coffee.test.js'
  , testDestinationPath = '/assets/javascripts/coffee.test.js';

describe('coffee compiler', function () {
  before(function () {
    app = mockServer({
      javascripts: { compiler: 'coffee' },
      public: 'app/public'
    });
  });

  after(function () {
    app.server.close();
  });

  it('should properly compile coffeescript files to javascript', function (done) {
    if (fs.existsSync(testDestinationFile))
      fs.unlinkSync(testDestinationFile);

    var expectedContent = fs.readFileSync(__dirname + '/fixtures/coffee.test.js').toString();

    supertest(app.server)
      .get(testDestinationPath)
      .expect(expectedContent)
      .end(done);
  });

  describe('if minify is enabled', function () {
    before(function () {
      app.server.close();
      app = mockServer({
        javascripts: { compiler: 'coffee', minify: true },
        public: 'app/public'
      });
    });

    it('should properly minify the compiled javascript', function (done) {
      if (fs.existsSync(testDestinationFile))
        fs.unlinkSync(testDestinationFile);

      var expectedContent = fs.readFileSync(__dirname + '/fixtures/coffee.test.min.js').toString();

      supertest(app.server)
        .get(testDestinationPath)
        .expect(expectedContent)
        .end(done);
    });
  });
  describe('if resolveFiles is enabled', function () {
    before(function () {
      app.server.close();
      app = mockServer({
        javascripts: {
          compiler: 'coffee',
          files: {
            'coffee.concatenate.js': [
              'coffee.concatenate.1.js',
              'coffee.concatenate.2.js'
            ]
          }
        },
        public: 'app/public'
      });
    });

    it('should properly concatenate the compiled javascripts', function (done) {
      testDestinationFile = __dirname + '/app/public/assets/javascripts/coffee.concatenated.js'
      testDestinationPath = '/assets/javascripts/coffee.concatenated.js';

      if (fs.existsSync(testDestinationFile))
        fs.unlinkSync(testDestinationFile);

      var expectedContent = fs.readFileSync(__dirname + '/fixtures/coffee.test.concatenated.js').toString();

      supertest(app.server)
        .get(testDestinationPath)
        .expect(expectedContent)
        .end(done);
    });
  });
});
