/** url过滤中间件 */
module.exports = function (mw) {

    return function* (next) {
        if (!/(\.js|\.css|\.ico|\.png|\.jpg|.aspx|.cshtml|.php)/.test(this.path)) {
            yield* mw.call(this);
        }else{
            yield next;
        }

    }

}