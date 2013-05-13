test:
	@./node_modules/.bin/mocha --require ./test/init.js --require should test/*.test.js

.PHONY: all test
