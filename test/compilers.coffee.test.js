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
});
