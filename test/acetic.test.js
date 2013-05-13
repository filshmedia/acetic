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
  app.use(_acetic.init());

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

describe("acetic middleware", function () {
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

describe("acetic helpers", function () {
  /*
   * JavaScript helper
   */
  it("should correctly build a script tag from a single file name", function () {
    var expectedHTML = "<script src=\"/assets/js/some-asset.js\"></script>";
    _acetic.helper("js")("some-asset.js").should.equal(expectedHTML);
  });

  it("should correctly build multiple script tags from multiple file names (as array)", function () {
    var expectedHTML = "<script src=\"/assets/js/some-asset.js\"></script><script src=\"/assets/js/blurb.js\"></script>";
    _acetic.helper("js")(["some-asset.js", "blurb.js"]).should.equal(expectedHTML);
  });

  it("should correctly build multiple script tags from multiple file names (as multiple arguments)", function () {
    var expectedHTML = "<script src=\"/assets/js/some-asset.js\"></script><script src=\"/assets/js/blurb.js\"></script>";
    _acetic.helper("js")("some-asset.js", "blurb.js").should.equal(expectedHTML);
  });

  it("should ignore external javascript links", function () {
    var expectedHTML = "<script src=\"http://www.example.com/test.js\"></script>";
    _acetic.helper("js")("http://www.example.com/test.js").should.equal(expectedHTML);
  });

  /*
   * CSS helper
   */
  it("should correctly build a link tag from a single file name", function () {
    var expectedHTML = "<link rel=\"stylesheet\" href=\"/assets/css/some-asset.css\" />";
    _acetic.helper("css")("some-asset.css").should.equal(expectedHTML);
  });

  it("should correctly build multiple link tags from multiple file names (as array)", function () {
    var expectedHTML = "<link rel=\"stylesheet\" href=\"/assets/css/some-asset.css\" /><link rel=\"stylesheet\" href=\"/assets/css/blurb.css\" />";
    _acetic.helper("css")(["some-asset.css", "blurb.css"]).should.equal(expectedHTML);
  });

  it("should correctly build multiple link tags from multiple file names (as multiple arguments)", function () {
    var expectedHTML = "<link rel=\"stylesheet\" href=\"/assets/css/some-asset.css\" /><link rel=\"stylesheet\" href=\"/assets/css/blurb.css\" />";
    _acetic.helper("css")("some-asset.css", "blurb.css").should.equal(expectedHTML);
  });

  it("should ignore external css links", function () {
    var expectedHTML = "<link rel=\"stylesheet\" href=\"http://www.example.com/test.css\" />";
    _acetic.helper("css")("http://www.example.com/test.css").should.equal(expectedHTML);
  });
});
