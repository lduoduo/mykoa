/** dev configure center */
'use strict';
const os = require('os');

module.exports = class Config {
    constructor() {

        /* current enviroment*/
        this.env = 'dev';
        /** local ip */
        this.ip = getLocalIps()[0];
        /* port no of server*/
        this.serverPort = 8080;
        /* port no of static server*/
        this.staticPort = 8090;
        /* url of static files*/
        this.frontURL =
            {
                js: '//' + this.ip + ':' + this.staticPort + '/js/',
                css: '//' + this.ip + ':' + this.staticPort + '/css/'
            };
        /* domain */
        this.domain = 'gooddogdesign.com';
        /* route rootpath */
        this.rootPath = '/koa';
        /* db url */
        // this.interUrl = "http://10.14.91.132:8090/nodeapi/";
        this.interUrl = 'http://' + this.ip + ':9999/nodeapi/';

    }
}

/** get local ip address */
function getLocalIps(flagIpv6) {
    var ifaces = os.networkInterfaces();
    var ips = [];
    var func = function (details) {
        if (!flagIpv6 && details.family === 'IPv6') {
            return;
        }
        ips.push(details.address);
    };
    for (var dev in ifaces) {
        ifaces[dev].forEach(func);
    }
    return ips;
};