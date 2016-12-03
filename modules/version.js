/** 服务器版本号打印中间件 */
'use strict';

module.exports = function(version){

    return function* (next){
        this.set('x-web-version',version);
        yield next;
    }

}