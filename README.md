acetic
======

`acetic` is a very basic asset compilation engine for express 3.x which supports `CoffeeScript` and `stylus`

## Usage

Here is a simple example using `express`:

```js
  var express = require("express")
    , acetic  = require("acetic");

  var app = express();

  app.use(new acetic({
    publicAssetsPath: "assets", // The subdirectory your compiled assets will be stored
    publicPath: __dirname + "/app/public", // Your public folder for static files
    assetsPath: __dirname + "/app/assets", // The base folder for your asset source files
    jsDirectory: "js", // The directory name for the compiled JavaScript files
    jsSourceDirectory: "coffeescripts", // The directory name for your CoffeeScript files, resolves to /app/assets/coffeescripts
    cssDirectory: "css", // The directory name for the compiled CSS files
    cssSourceDirectory: "stylus", // The directory name for your Stylus files, resolves to /app/assets/stylus
  }).init());

  app.listen(8899);
```

## License

The MIT License (MIT)

Copyright (c) 2013 Sascha Gehlich and FILSH Media GmbH

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
