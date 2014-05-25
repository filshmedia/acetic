var fs = require('fs')
  , supertest = require('supertest');

var app
  , testSourceFile = __dirname + '/app/assets/javascripts/browserify/browserify.test.js'
  , testDestinationFile = __dirname + '/app/public/assets/javascripts/browserify/browserify.test.js'
  , testDestinationPath = '/assets/javascripts/browserify/browserify.test.js';

describe('browserify compiler', function () {
  before(function () {
    app = mockServer({
      assets: {
        javascripts: { compiler: 'browserify' }
      },
      public: 'app/public'
    });
  });

  after(function () {
    app.server.close();
  });

  it('should properly browserify javascript files to javascript', function (done) {
    if (fs.existsSync(testDestinationFile))
      fs.unlinkSync(testDestinationFile);

    var expectedContent = fs.readFileSync(__dirname + '/fixtures/browserify/browserify.test.js').toString();

    supertest(app.server)
      .get(testDestinationPath)
      .expect(200)
      .end(function (err, res) {
        (res.text + '\n').should.equal(expectedContent);
        done();
      });
  });
});
