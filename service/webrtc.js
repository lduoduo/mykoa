/** service logic control of page test */
'use strict';

var view  = require('../modules/render/bigpipe/bp');
var config = require('../config');

module.exports = {
    index: function* (next){

        this.body = new view('webrtc',this);

        this.body.page('webrtc',{
            title: 'webrtc demo'
        });

        yield this.body.render();


    }
}