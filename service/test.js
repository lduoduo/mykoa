/** 具体的service层业务逻辑 */
'use strict';

module.exports = {
    index: function* (next){
        this.body = this.url;
    }
}