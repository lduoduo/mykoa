'use strict';

var koa = require('koa');
var app = koa();

var statics = require('koa-static');
/** Access-Control-Allow-Origin */
var cors = require('koa-cors');

var config = require('./config');
var staticPort = config.staticPort;
var env = config.env;


module.exports = function () {

    if (env == 'dev') {

        app.use(cors());

        /** static file folder */
        app.use(statics(__dirname + '/public'));

        app.listen(staticPort);

        console.log('static on ' + staticPort);
    }

}