'use strict';

/** start main server */
var server = require('./app-server')();
/** start static server(send staic files such as js/css/jpg/png) */
var statics = require('./app-static')();