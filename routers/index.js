/** route configure center */
'use strict';

var route = require('koa-route');
var compose = require('koa-compose');
var config = require('../config');
var service = require('../service');

exports.start = function () {
    var rootPath = config.rootPath;
    return compose([

        //post data
        route.post(/\/data\/\w+/, service.data.index),

        //page test
        route.get(rootPath + '/test', service.test.index),
        route.get(rootPath + '/webrtc', service.webrtc.index),
        route.get(rootPath + '/canvas', service.canvas.index),
        
    ]);
}
