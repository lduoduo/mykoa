'use strict';

/** 启动主服务器 */
var server = require('./app-server')();
/** 启动静态资源服务器 */
var statics = require('./app-static')();