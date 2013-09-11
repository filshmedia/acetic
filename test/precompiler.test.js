describe('Precompiler', function() {
  describe('if javascript compiler is set to coffee', function () {
    it('should properly compile coffeescript files to javascript');
    describe('if minify is enabled', function () {
      it('should properly minify the compiled javascripts');
    });
    describe('if concatenate is enabled', function () {
      it('should properly concatenate the compiled javascripts');
    });
  });

  describe('if javascript compiler is set to coffeeify', function () {
    it('should properly compile and browserify coffeescript files');
    describe('if minify is enabled', function () {
      it('should properly minify the compiled javascripts');
    });
    describe('if concatenate is enabled', function () {
      it('should properly concatenate the compiled javascripts');
    });
  });

  describe('if javascript compiler is set to browserify', function () {
    it('should properly browserify coffeescript files');
    describe('if minify is enabled', function () {
      it('should properly minify the compiled javascripts');
    });
    describe('if concatenate is enabled', function () {
      it('should properly concatenate the compiled javascripts');
    });
  });

  describe('if stylesheets compiler is set to stylus', function () {
    it('should properly compile stylus files');
    describe('if minify is enabled', function () {
      it('should properly minify the compiled css');
    });
    describe('if concatenate is enabled', function () {
      it('should properly concatenate the compiled css');
    });
  });
});
