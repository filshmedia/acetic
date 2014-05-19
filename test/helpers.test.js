var app;
describe('Template helpers', function () {
  describe('without cdn', function () {
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

      describe('if the second argument is not a string', function () {
        it('should use it to render additional attributes', function () {
          var output = app.acetic.helper.use('javascripts')('test.js', { 'data-main': 'foobarbaz!' });
          output.should.equal('<script src="/assets/javascripts/test.js" data-main="foobarbaz!"></script>');
        });
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

  describe('with cdn enabled', function () {
    before(function () {
      app = mockServer({
        cdn: "http://my.cdn",
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

    it('should add the cdn to the href attribute', function () {
      var output = app.acetic.helper.use('stylesheets')('application.css');
      output.should.equal('<link rel="stylesheet" href="http://my.cdn/assets/stylesheets/application.css" />');
    });
  });
});
