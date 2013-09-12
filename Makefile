REPORTER = spec

test:
	@./node_modules/.bin/mocha \
		--require ./test/init.js \
		--require should \
		--reporter $(REPORTER) \
		test/*.test.js

coverage: lib-cov
	@ACETIC_COV=1 $(MAKE) REPORTER=html-cov > coverage.html

lib-cov: lib
	@./node_modules/.bin/jscoverage $< $@

.PHONY: all test
