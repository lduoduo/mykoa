var route = require('koa-route');
var compose = require('koa-compose');
var config = require('../config');
var service = require('../service');
exports.start = function () {
    return compose([
        //test页面
        route.get(config.rootPath + '/test', service.test.index),
        //aa页面
        route.get(config.rootPath + '/aa', service.aa.index),
    ]);
}
