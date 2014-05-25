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

  describe('if the requested file does not have a source counterpart', function () {
    it('should serve the requested file', function (done) {
      supertest(app.server)
        .get('/assets/javascripts/keep.test.js')
        .expect(200)
        .end(done);
    });
  });

  describe('if the requested file is not handled by a compiler but is inside a compiler path', function () {
    // If e.g. a .hbs file is requested inside public/javascripts, the middleware should still
    // look for the .hbs counterpart inside the source folder of the responsible compiler
    // and copy it to the requested path.
    it('should copy the source file to the requested path and serve it', function (done) {
      var testDestinationFile = __dirname + '/app/public/assets/javascripts/source.test.hbs';
      if (fs.existsSync(testDestinationFile))
        fs.unlinkSync(testDestinationFile);

      supertest(app.server)
        .get('/assets/javascripts/source.test.hbs')
        .expect(200)
        .end(done);
    });
  });

  describe('if the requested file does have a source counterpart with the same extension', function () {
    it('should copy the source file to the requested path and serve it', function (done) {
      var testDestinationFile = __dirname + '/app/public/assets/javascripts/source.test.js';
      if (fs.existsSync(testDestinationFile))
        fs.unlinkSync(testDestinationFile);

      supertest(app.server)
        .get('/assets/javascripts/source.test.js')
        .expect(200)
        .end(done);
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

  describe('when compilation fails', function () {
    before(function () {
      app = mockServer({
        public: 'app/public'
      });
    });

    after(function () {
      app.server.close();
    });

    describe('when using coffee as javascript compiler', function () {
      it('should render coffeescript errors to the destination file', function (done) {
        testDestinationFile = __dirname + '/app/public/assets/javascripts/coffee/middleware.error.test.js';
        testDestinationPath = '/assets/javascripts/coffee/middleware.error.test.js';
        if (fs.existsSync(testDestinationFile))
          fs.unlinkSync(testDestinationFile);

        supertest(app.server)
          .get(testDestinationPath)
          .expect(200)
          .end(function (err, res) {
            expectFileEquality(
              testDestinationFile,
              __dirname + '/fixtures/coffee/middleware.error.test.js'
            );

            done();
          });
      });
    });

    describe('when using coffeeify as javascript compiler', function () {
      before(function () {
        app.server.close();
        app = mockServer({
          assets: {
            javascripts: {
              compiler: 'coffeeify'
            },
          },
          public: 'app/public'
        });
      });

      it('should render coffeeify errors to the destination file', function (done) {
        testDestinationFile = __dirname + '/app/public/assets/javascripts/coffeeify/middleware.error.test.js';
        testDestinationPath = '/assets/javascripts/coffeeify/middleware.error.test.js';
        if (fs.existsSync(testDestinationFile))
          fs.unlinkSync(testDestinationFile);

        supertest(app.server)
          .get(testDestinationPath)
          .expect(200)
          .end(function (err, res) {
            expectFileEquality(
              testDestinationFile,
              __dirname + '/fixtures/coffeeify/middleware.error.test.js'
            );

            done();
          });
      });
    });

    describe('when using stylus as css compiler', function () {
      it('should render stylus errors to the destination file', function (done) {
        testDestinationFile = __dirname + '/app/public/assets/stylesheets/stylus/stylus.error.test.css';
        testDestinationPath = '/assets/stylesheets/stylus/stylus.error.test.css';
        if (fs.existsSync(testDestinationFile))
          fs.unlinkSync(testDestinationFile);

        supertest(app.server)
          .get(testDestinationPath)
          .expect(200)
          .end(function (err, res) {
            expectFileEquality(
              testDestinationFile,
              __dirname + '/fixtures/stylus/stylus.error.test.css'
            );

            done();
          });
      });
    });
  })
});
