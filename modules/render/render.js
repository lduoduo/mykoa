/** set template engine */

var co = require('co');
var views = require('co-views');

module.exports.render = views(__dirname + '../../views', {
    map: { html: 'ejs' }
});