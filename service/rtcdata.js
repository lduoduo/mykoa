/** service logic control of page test */
'use strict';

var view = require('../modules/render/bigpipe/bp');
var config = require('../config');

module.exports = {
    index: function* (next) {

        this.body = new view('rtcdata', this);

        this.body.page('rtcdata', {
            title: 'rtcdata demo'
        });

        this.body.addReferences('zepto.min.js');
        this.body.addReferences('fastclick.min.js');
        this.body.addReferences('sweetalert.min.js');
        this.body.addReferences('sweetalert.min.css');
        this.body.addReferences('socket.io.slim.min.js');
        this.body.addReferences('rtcPeer.js');

        yield this.body.render();

    }
}