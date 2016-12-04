/** service logic control of page test */
'use strict';

module.exports = {
    index: function* (next){

        var tmp = this.body;
        this.body = this.url;

        setTimeout(function(){
            tmp += 'duoduo';
        },3000);

    }
}