/** service logic control of data interface */
'use strict';
var request = require('request');


module.exports = {
    index: function* (next) {
        var url = this.url.match(/\/data\/(\w+)?/, '');
        url = url.length > 1 ? url[1] : url[0];
        var addressip = this.ip.replace(/::ffff:/,'');
        var para = this.request.body;
        this.body = this.url;
    }
}