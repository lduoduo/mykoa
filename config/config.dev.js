/** dev configure center */
'use strict';

module.exports = class Config {
    constructor() {

        /*当前站点环境*/
        this.env = 'dev';
        /*站点的端口*/
        this.serverPort = 8080;
        /*本地静态资源的端口*/
        this.staticPort = 8090;
        /*站点引用静态资源的地址*/
        this.frontURL =
            {
                js: '//localhost:' + this.staticPort + '/dest/js/',
                css: '//localhost:' + this.staticPort + '/dest/css/'
            };
        /*域名*/
        this.domain = 'gooddogdesign.com';
        /*路由虚拟目录*/
        this.rootPath = '/koa';
        /*数据库接口地址*/
        this.interUrl = "http://10.14.91.132:8090/nodeapi/";
        // this.interUrl = 'http://localhost:9999/api';

    }
}