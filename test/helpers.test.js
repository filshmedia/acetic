describe('Template helpers', function () {
  before(function () {
    app = mockServer({
      javascripts: {
        destination: 'assets/javascripts'
      },
      stylesheets: {
        destinaton: 'assets/stylesheets'
      }
    });
  });

  after(function () {
    app.server.close();
  });

  describe('jsAsset()', function () {
    it('should generate a script tag when one file path is given', function () {
      var output = app.acetic.helper.use('javascripts')('application.js');
      output.should.equal('<script src="/assets/javascripts/application.js"></script>');
    });
    it('should generate multiple script tags when multiple paths are given', function () {
      var output = app.acetic.helper.use('javascripts')('test.js', 'application.js');
      output.should.equal('<script src="/assets/javascripts/test.js"></script><script src="/assets/javascripts/application.js"></script>');
    });
    it('should render a url instead of a path if a url is given', function () {
      var output = app.acetic.helper.use('javascripts')('http://google.com/test.js');
      output.should.equal('<script src="http://google.com/test.js"></script>');
    });
  });

  describe('cssAsset()', function () {
    it('should generate a meta tag when one file path is given', function () {
      var output = app.acetic.helper.use('stylesheets')('application.css');
      output.should.equal('<link rel="stylesheet" href="/assets/stylesheets/application.css" />');
    });
    it('should generate multiple meta tags when multiple paths are given', function () {
      var output = app.acetic.helper.use('stylesheets')('reset.cs', 'application.css');
      output.should.equal('<link rel="stylesheet" href="/assets/stylesheets/reset.cs" /><link rel="stylesheet" href="/assets/stylesheets/application.css" />');
    });
    it('should render a url instead of a path if a url is given', function () {
      var output = app.acetic.helper.use('stylesheets')('http://google.com/test.css');
      output.should.equal('<link rel="stylesheet" href="http://google.com/test.css" />');
    });
  });
});
