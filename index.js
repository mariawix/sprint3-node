'use strict';

var fs = require('fs');
var path = require('path');
var config = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'config.eslintrc')));

module.exports = config;
