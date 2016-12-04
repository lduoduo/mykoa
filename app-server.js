'use strict';

var koa = require('koa');
var app = koa();

var co = require('co');
var session = require('koa-session');
var compose = require('koa-compose');

var config = require('./config');
var modules = require('./modules');
var routers = require('./routers');
var service = require('./service');

//session config
var CONFIG = {
  key: 'koa:sess', /** (string) cookie key (default is koa:sess) */
  maxAge: 86400000, /** (number) maxAge in ms (default is 1 days) */
  overwrite: true, /** (boolean) can overwrite or not (default true) */
  httpOnly: true, /** (boolean) httpOnly or not (default true) */
  signed: true, /** (boolean) signed or not (default true) */
};


// //x-response-time
// app.use(function* (next) {
// 	const start = new Date();
// 	console.log('line 1 start:' + start);

// 	yield next;
// 	const ms = new Date() - start;
// 	console.log('line 5 start:' + start);

// 	this.set('X-response-time', `${ms}ms`);

// });

// //log time
// app.use(function* (next) {
// 	const start = new Date();
// 	console.log('line 2 start:' + start);

// 	yield next;
// 	const ms = new Date() - start;
// 	console.log('line 4 start:' + start);

// 	console.log('%s %s : %s ms', this.method, this.url, ms);

// });

// //response
// app.use(function* (next) {
// 	console.log('line 3');
// 	this.body = 'hello dd';
// });

module.exports = function(){
	Promise.all([

		co(start)

	]).catch(function(e){

		console.log('err:'+e.stack);

	});
};

function* start(){
	var ver = require('./package.json').version;

	var mw = compose([
		/** control internal error */
		service['500'],
		/** send response time to browser */
		modules.timer(),
		/** send version of server to browser */
		modules.version(ver),
		/** init session storage */
		session(CONFIG,app),
		/** init local route */
		routers.start(),
		/** handle all 404 errors */
		service['404']
	]);

	app.use(modules.urlFilter(mw));

	// app.use(service['404']);

	app.listen(config.serverPort);

	app.on('error',function(err,ctx){
		console.log('err:'+err.stack);
	});

	console.log('server on '+ config.serverPort);

}