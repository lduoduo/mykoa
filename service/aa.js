/** service logic control of page aa */
'use strict';

module.exports = {
    index: function* (next){
        this.body = this.url;
    }
}