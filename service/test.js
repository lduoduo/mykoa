/** service logic control of page test */
'use strict';

var view  = require('../modules/render/bigpipe/bp');
var config = require('../config');

module.exports = {
    index: function* (next){

        this.body = new view('test',this);
        // var tmp = this.body;
        // this.body = this.url;
        this.body.page('testa',{
            title: 'test koa'
        });

        this.body.add('a');
        this.body.add('b');
        this.body.add('c');
        this.body.add('d',config.interUrl + "list/getlist");

        yield this.body.render();

        // setTimeout(function(){
        //     tmp += 'duoduo';
        // },3000);

    }
}