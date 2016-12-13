/** dev configure center */
'use strict';
const os = require('os');

module.exports = class Config {
    constructor() {

        /** 项目名称 */
        this.appName = 'mykoa';
        /*当前站点环境*/
        this.env = 'dev';
        /** local ip */
        this.ip = getLocalIps()[1];
        /* port no of server*/
        this.serverPort = 8080;
        /* port no of static server*/
        this.staticPort = 8090;
        /* url of static files*/
        /*站点的https端口*/
        this.serverPorts = 8081;
        /*本地静态资源的端口*/
        this.staticPorts = 8091;
        /*站点引用静态资源的地址*/
        this.frontURL = {
            js: 'https://' + this.ip + ':' + this.staticPorts + '/js/',
            css: 'https://' + this.ip + ':' + this.staticPorts + '/css/'
        };
        /* domain */
        this.domain = 'gooddogdesign.com';
        /* route rootpath */
        this.rootPath = '/koa';
        /* db url */
        // this.interUrl = "http://10.14.91.132:8090/nodeapi/";
        this.interUrl = 'http://' + this.ip + ':9999/nodeapi/';

        // this.monitorUrl = '//' + this.ip + ':9999/updateLog';
        this.monitorUrl = '//' + this.ip + ':9998/';
    }
}

/** get local ip address */
function getLocalIps(flagIpv6) {
    var ifaces = os.networkInterfaces();
    var ips = [];
    var func = function(details) {
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