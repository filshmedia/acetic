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

    var expectedContent = fs.readFileSync(__dirname + '/fixtures/stylus/stylus.test.css').toString();

    supertest(app.server)
      .get(testDestinationPath)
      .expect(expectedContent)
      .end(done);
  });
});
