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

    var expectedContent = fs.readFileSync(__dirname + '/fixtures/coffeeify/coffeeify.test.js').toString();

    supertest(app.server)
      .get(testDestinationPath)
      .expect(200)
      .end(function (err, res) {
        (res.text + '\n').should.equal(expectedContent);
        done();
      });
  });
});
