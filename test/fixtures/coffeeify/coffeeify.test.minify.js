(function e(b,g,d){function c(k,i){if(!g[k]){if(!b[k]){var h=typeof require=="function"&&require;if(!i&&h){return h(k,!0)}if(a){return a(k,!0)}throw new Error("Cannot find module '"+k+"'")}var j=g[k]={exports:{}};b[k][0].call(j.exports,function(l){var m=b[k][1][l];return c(m?m:l)},j,j.exports,e,b,g,d)}return g[k].exports}var a=typeof require=="function"&&require;for(var f=0;f<d.length;f++){c(d[f])}return c})({1:[function(b,c,a){c.exports={log:function(){return console.log("This should be coffeeified!")}}},{}],2:[function(b,c,a){var c;c=b("./coffeeify-module.test.coffee");c.log()},{"./coffeeify-module.test.coffee":1}]},{},[2]);
