/**路由配置中心 */
'use strict';

var route = require('koa-route');
var compose = require('koa-compose');
var config = require('../config');
var service = require('../service');

exports.start = function () {
    var rootPath = config.rootPath;
    return compose([
        //test页面
        route.get(rootPath + '/test', service.test.index),
        //aa页面
        route.get(rootPath + '/aa', service.aa.index),
    ]);
}
