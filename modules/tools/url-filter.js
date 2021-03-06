/** middleware for url-filter */
'use strict';

module.exports = function (mw) {

    return function* (next) {
        console.log('http type: ' + this.protolcol);
        if (!/(\.js|\.css|\.ico|\.png|\.jpg|.aspx|.cshtml|.php)/.test(this.path)) {
            yield* mw.call(this);
        } else {
            yield next;
        }

    }

}