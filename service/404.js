/** 404页面 */
var url = require('url');
var config = require('../config');

module.exports = function* (next) {
    var accept = this.accept('html', 'json');
    if (accept == 'html') {
        var redirectUrl = url.format({
            domain: config.domain,
            path: 'page-not-found'
        });
        this.redirect(redirectUrl);
    }
}
