![acetic logo](http://s1.directupload.net/images/130913/58i7fku2.png)

acetic is an asset (pre-)compilation engine for node.js. It is compatible with `express` 3.x and supports `coffeescript`, `browserify`, `coffeeify`, `stylus` and `nib`

[![NPM version][NPMIMGURL]][NPMURL] [![Dependency Status][DependencyStatusIMGURL]][DependencyStatusURL] [![Build Status][BuildStatusIMGURL]][BuildStatusURL]
======
[NPMIMGURL]:                https://badge.fury.io/js/acetic.png
[BuildStatusIMGURL]:        https://secure.travis-ci.org/filshmedia/acetic.png?branch=master
[DependencyStatusIMGURL]:   https://gemnasium.com/filshmedia/acetic.png
[NPMURL]:                   //npmjs.org/package/acetic
[BuildStatusURL]:           //travis-ci.org/filshmedia/acetic  "Build Status"
[DependencyStatusURL]:      //gemnasium.com/filshmedia/acetic "Dependency Status"

## Features

* Automatically compile `coffee-script` and `stylus` files when they have been changed
* Pre-compile assets for deployment to avoid that assets are compiled in production
* Support for JavaScript and CSS compression
* Support for `browserify` and `coffeeify`
* Support for `nib` when using `stylus`

## Installation

First, install the npm module:

```bash
$ npm install acetic
```

Then, initialize the middleware using express.js. Here is an example:

```js
var express = require('express')
  , acetic  = require('acetic')
  , app = express();

app.use(new acetic(__dirname + "/acetic.yml").init());
app.use(express.static(__dirname + "/public"));
// We need `express.static` so that our compiled assets are actually served to the user.

app.listen(8080);
```

### Configuration
acetic is configured via a JSON or YAML file. In this file you define how acetic
behaves in the different environments. Here's an example:

```yaml
defaults: &defaults
  public: "./public"
  debug: true
  javascripts:
    compiler: "coffee"
    source: "./assets/javascripts"
    destination: "./public/assets/javascripts"
  stylesheets:
    compiler: "stylus"
    source: "./assets/stylesheets"
    destination: "./public/assets/stylesheets"

development:
  <<: *defaults

production:
  <<: *defaults
  debug: false

test:
  <<: *defaults
```http://s1.directupload.net/images/130913/58i7fku2.png

__Please note:__ All paths in your configuration file are relative to the
directory your configuration file is placed in.

## Template Helpers

acetic provides two helpers that automatically generate HTML tags for you so
that you don't have to mess around with paths:

```
!= jsAsset('application.js')
```

and

```
!= cssAsset('application.css')
```

## Precompiling assets

acetic comes with an `acetic` executable that allows you to precompile your
assets right after you deploy your app:

```
$ acetic -h

  Usage: acetic [options] [command]

  Commands:

    precompile           Precompiles the assets that have
                         been defined in the configuration
                         file

  Options:
    -c, --config <file>  Use <file> as the configuration file
```

### Configuring the precompiler

Since acetic doesn't know which files you would like to precompile, you have to
tell it by specifying a `files` array in the configuration, like so:

```yaml
production:
  public: "./public"
  javascripts:
    compiler: "coffee"
    minify: true
    source: "./assets/javascripts"
    destination: "./public/assets/javascripts"
    files:
      - "application.coffee"
      - "users/form.coffee"
  stylesheets:
    compiler: "stylus"
    minify: true
    source: "./assets/stylesheets"
    destination: "./public/assets/stylesheets"
    files:
      - "reset.styl"
      - "application.styl"
```

After running `acetic precompile` in the production environment, acetic will
precompile your assets and write them to the destination folder you specified.

```
Deployment example using `capistrano` coming soon!
```

## License

The MIT License (MIT)

Copyright (c) 2013 Sascha Gehlich and FILSH Media GmbH

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
