var fs = require('fs')
  , supertest = require('supertest');

var app
  , testSourceFile = __dirname + '/app/assets/stylesheets/stylus.test.styl'
  , testDestinationFile = __dirname + '/app/public/assets/stylesheets/stylus.test.css'
  , testDestinationPath = '/assets/stylesheets/stylus.test.css';

describe('stylus compiler', function () {
  before(function () {
    app = mockServer({
      stylesheets: { compiler: 'stylus' },
      public: 'app/public'
    });
  });

  after(function () {
    app.server.close();
  });

  it('should properly compile stylus files to css', function (done) {
    if (fs.existsSync(testDestinationFile))
      fs.unlinkSync(testDestinationFile);

    var expectedContent = fs.readFileSync(__dirname + '/fixtures/stylus.test.css').toString();

    supertest(app.server)
      .get(testDestinationPath)
      .expect(expectedContent)
      .end(done);
  });
  describe('if minify is enabled', function () {
    before(function () {
      app.server.close();
      app = mockServer({
        stylesheets: { compiler: 'stylus', minify: true },
        public: 'app/public'
      });
    });

    it('should properly minify the compiled css', function (done) {
      if (fs.existsSync(testDestinationFile))
        fs.unlinkSync(testDestinationFile);

      var expectedContent = fs.readFileSync(__dirname + '/fixtures/stylus.test.min.css').toString();

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
        stylesheets: {
          compiler: 'stylus',
          files: {
            'stylus.concatenate.js': [
              'stylus.concatenate.1.js',
              'stylus.concatenate.2.js'
            ]
          }
        },
        public: 'app/public'
      });
    });

    it('should properly concatenate the compiled css', function (done) {
      testDestinationFile = __dirname + '/app/public/assets/stylesheets/stylus.concatenated.css'
      testDestinationPath = '/assets/stylesheets/stylus.concatenated.css';

      if (fs.existsSync(testDestinationFile))
        fs.unlinkSync(testDestinationFile);

      var expectedContent = fs.readFileSync(__dirname + '/fixtures/stylus.test.concatenated.css').toString();

      supertest(app.server)
        .get(testDestinationPath)
        .expect(expectedContent)
        .end(done);
    });
  });
});
