var supertest = require('supertest')
  , fs = require('fs')
  , utils = require('../lib/utils');

var app
  , testSourceFile = __dirname + '/app/assets/javascripts/middleware.test.coffee'
  , testDestinationFile = __dirname + '/app/public/assets/javascripts/middleware.test.js'
  , testDestinationPath = '/assets/javascripts/middleware.test.js'
  , testSimpleDestinationPath = '/assets/javascripts/middleware.simple.test.js';

describe('Middleware', function() {
  describe('if checkModifiedDate is enabled', function() {
    before(function () {
      app = mockServer({
        checkModifiedDate: true,
        public: 'app/public'
      });
    });

    after(function () {
      app.server.close();
    });

    it('should compile assets if the destination file does not exist', function (done) {
      if (fs.existsSync(testDestinationFile))
        fs.unlinkSync(testDestinationFile);

      supertest(app.server)
        .get(testDestinationPath)
        .expect(200)
        .end(done);
    });

    it('should compile assets if the source file is newer than the destination file', function (done) {
      var initialModifiedDate = utils.getModifiedDate(testDestinationFile);

      // Let it recompile
      _after(1000, function () {

        // Re-write the file
        var content = fs.readFileSync(testSourceFile);
        fs.writeFileSync(testSourceFile, content);

        supertest(app.server)
          .get(testDestinationPath)
          .expect(200)
          .end(function (err, res) {
            if (err) throw err;

            // Check whether the destination file has been updated
            var newModifiedDate = utils.getModifiedDate(testDestinationFile);
            (newModifiedDate > initialModifiedDate).should.be.true;

            done();
          });
      });
    });

    it('should not compile assets if the source file is older than the destination file', function (done) {
      var initialModifiedDate = utils.getModifiedDate(testDestinationFile);

      supertest(app.server)
        .get(testDestinationPath)
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;

          // Check whether the destination file has been updated
          var newModifiedDate = utils.getModifiedDate(testDestinationFile);
          (+newModifiedDate).should.equal(+initialModifiedDate);

          done();
        });
    });
  });

  describe('if checkModifiedDate is disabled', function() {
    before(function () {
      app = mockServer({
        checkModifiedDate: false,
        public: 'app/public'
      });
    });

    after(function () {
      app.server.close();
    });

    it('should compile assets if the destination file does not exist', function(done) {
      if (fs.existsSync(testDestinationFile))
        fs.unlinkSync(testDestinationFile);

      supertest(app.server)
        .get(testDestinationPath)
        .expect(200)
        .end(done);
    });
    it('should compile assets if the source file is newer than the destination file', function (done) {
      var initialModifiedDate = utils.getModifiedDate(testDestinationFile);

      // Let it recompile
      _after(1000, function () {

        // Re-write the file
        var content = fs.readFileSync(testSourceFile);
        fs.writeFileSync(testSourceFile, content);

        supertest(app.server)
          .get(testDestinationPath)
          .expect(200)
          .end(function (err, res) {
            if (err) throw err;

            // Check whether the destination file has been updated
            var newModifiedDate = utils.getModifiedDate(testDestinationFile);
            (newModifiedDate > initialModifiedDate).should.be.true;

            done();
          });
      });
    });
    it('should compile assets if the source file is older than the destination file', function (done) {
      var initialModifiedDate = utils.getModifiedDate(testDestinationFile);

      // Let it recompile
      _after(1000, function () {

        supertest(app.server)
          .get(testDestinationPath)
          .expect(200)
          .end(function (err, res) {
            if (err) throw err;

            // Check whether the destination file has been updated
            var newModifiedDate = utils.getModifiedDate(testDestinationFile);
            (newModifiedDate > initialModifiedDate).should.be.true;

            done();
          });
      });
    });
  });

  describe('if compile is disabled', function() {
    before(function () {
      app = mockServer({
        compile: false,
        public: 'app/public'
      });
    });

    after(function () {
      app.server.close();
    });

    it('should not compile assets', function (done) {
      if (fs.existsSync(testDestinationFile))
        fs.unlinkSync(testDestinationFile);

      supertest(app.server)
        .get(testDestinationPath)
        .expect(404)
        .end(done);
    });
  });

  describe('non-compilable assets', function () {
    var destinationFile, destinationPath;

    before(function () {
      app = mockServer({
        public: 'app/public'
      });
    });

    it('should copy and serve a simple javascript file from the coffeescripts folder', function (done) {
      destinationFile = __dirname + '/app/public/assets/javascripts/middleware.simple.test.js';
      destinationPath = '/assets/javascripts/middleware.simple.test.js';

      if (fs.existsSync(destinationFile))
        fs.unlinkSync(destinationFile);

      supertest(app.server)
        .get(destinationPath)
        .expect(200, fs.readFileSync(destinationFile))
        .end(done);
    });

    it('should copy and serve a simple css file from the stylus folder', function (done) {
      destinationFile = __dirname + '/app/public/assets/stylesheets/middleware.simple.test.css';
      destinationPath = '/assets/stylesheets/middleware.simple.test.css';

      if (fs.existsSync(destinationFile))
        fs.unlinkSync(destinationFile);

      supertest(app.server)
        .get(destinationPath)
        .expect(200, fs.readFileSync(destinationFile))
        .end(done);
    });
  });
});
