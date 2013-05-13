var express   = require("express")
  , acetic    = require("../lib/acetic")
  , supertest = require("supertest")
  , fs        = require("fs");

// Create an express.js instance and
// attach an acetic instance
var app, _acetic;
before(function () {
  app = express();

  // Use acetic
  _acetic = new acetic({
    publicAssetsPath: "assets",
    publicPath: __dirname + "/app/public",
    assetsPath: __dirname + "/app/assets",
    jsDirectory: "js",
    jsSourceDirectory: "coffeescripts",
    cssDirectory: "css",
    cssSourceDirectory: "stylus"
  });
  app.use(_acetic);

  app.listen(8899);
});

// Clean the compiled files
before(function () {
  [
    __dirname + "/app/public/assets/js/some-asset.js",
    __dirname + "/app/public/assets/css/some-asset.css"
  ].forEach(function (file) {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
    }
  });
});

describe("acetic", function () {
  it("should ignore requests to paths apart from the asset path", function (done) {
    supertest(app)
      .get("/something-else/blah.js")
      .expect(404)
      .end(done);
  });

  it("should correctly compile a coffee-script asset to js", function (done) {
    supertest(app)
      .get("/assets/js/some-asset.js")
      .expect(200)
      .end(function (err, res) {
        fs.existsSync(__dirname + "/app/public/assets/js/some-asset.js").should.be.true;
        done();
      });
  });

  it("should correctly compile a stylus asset to css", function (done) {
    supertest(app)
      .get("/assets/css/some-asset.css")
      .expect(200)
      .end(function (err, res) {
        fs.existsSync(__dirname + "/app/public/assets/css/some-asset.css").should.be.true;
        done();
      });
  });
});
