/** service logic control of page test */
'use strict';

var view  = require('../modules/render/bigpipe/bp');
var config = require('../config');

module.exports = {
    index: function* (next){

        this.body = new view('canvas',this);

        this.body.page('canvas_scale',{
            title: 'canvas demo'
        });

        yield this.body.render();

    }
}