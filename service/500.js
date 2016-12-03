/** 500 内部错误展示 */
'use strict';

module.exports = function* (next) {
    try {
        yield next;
    } catch (e) {
        this.body = "500 happens";
    }
}
