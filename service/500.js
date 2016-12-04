/** 500 internal error control */
'use strict';

module.exports = function* (next) {
    try {
        yield next;
    } catch (e) {
        this.body = "500 happens";
    }
}
