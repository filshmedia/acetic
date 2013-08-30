test:
	@./node_modules/.bin/mocha --require ./test/init.js --require should --reporter spec test/*.test.js

.PHONY: all test
