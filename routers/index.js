/** route configure center */
'use strict';

var route = require('koa-route');
var compose = require('koa-compose');
var config = require('../config');
var service = require('../service');

exports.start = function () {
    var rootPath = config.rootPath;
    return compose([
        //page test
        route.get(rootPath + '/test', service.test.index),
        //page aa
        route.get(rootPath + '/aa', service.aa.index),
    ]);
}
