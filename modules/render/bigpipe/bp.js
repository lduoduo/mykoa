/** try to use the thought of bigpipe to render the templates */
/**
 * created by duoduo on 2016-1204
 * how to use:
 *  - init:
 *      this.body = new View(option, ctx);
 *  - add partial tpl:
 *      this.body.add(tpl_folder, data/url)
 *  - render html
 *      yield this.body.render()
 * tips:
 *  - 1. option = {
 *      view, //page folder name
 *      tpl //tpl folder name, will use the same name as view name if not set;
 *    }
 *    2. option = string;
 *      //will set page folder name and tpl folder name as the input string;
 */
'use strict';

var Readable = require('stream').Readable;
var co = require('co');
var path = require('path');
var ejs = require('ejs');
var fs = require('fs');

var config = require('../../../config');
var render = require('../render');

const viewPath = '../../views/';
const tplPath = '../../tpl/';

/** for testing */
const sleep = ms => new Promise(r => setTimeout(r, ms));

module.exports = class View extends Readable {
    /** why need ctx here? we need pass in common variables in koa to use */
    constructor(option, ctx) {

        super();

        ctx.type = "html";

        this.data = {

            /** states of server */
            state: ctx.state || {},
            /** querystring object of request */
            query: ctx.query || {},
            staticPaths: 'localhost:8090', //hardcode for now
            config: config

        };

        this.components = [];
        /** render tpls in order, need pointer as index number */
        this.pointer = this.components.length;

        /** set page folder and tpl folder */
        this.viewFolder = this.tplFoler = "";
        if (typeof option == "string") {
            this.viewFolder = this.tplFoler = option;
        } else if (option instanceof 'Object') {
            this.viewFolder = option.view;
            this.tplFoler = option.tpl || option.view;
        } else {
            new Error('invalid param for option in bp.js');
            return;
        }
        if (!this.viewFolder) {
            new Error('invalid param for option in bp.js');
            return;
        }
    }

    /**
     *  according to node api, must implete _read() method here
     *  refer to : https://nodejs.org/api/stream.html#stream_new_stream_readable_options
     * */
    _read() {

    }

    /** render main page */
    page(name, data) {

        this.data.pageName = name;
        /** not support deep copy here */
        Object.assign(this.data, data);

    }

    /** manually add tpl to render in service
     *  param: {
     *      name: //tpl name,
     *      url: //url or json data
     *      cb: callback
     *  }
     */
    add(name, url, cb) {
        this.components.push({
            name: name,
            url: url,
            cb: cb
        });
    }

    /** render html */
    render() {

        var body = this;

        return function* () {
            /** render page view */
            var content = yield render(body.viewFolder + "/" + body.data.pageName, body.data);

            body.push(content);

            /** render tpl components*/
            renderComponents(body);
        }
    }
}

function renderComponents(body) {
    // return function (done) {
        let promises = []; let count = body.components.length;

        body.components.forEach(function (item) {
        // for(let i=0;i<body.components.length;i++){
            // let item = body.components[i];
            let comp = item;
            let name = item.name;
            let url = item.url;
            let promise;

            promise = co(function* () {
                return yield renderTpl(body, item, url);
            }).then(function (html) {
                end(html, name);
            });

            promises.push(promise);
        });

        Promise.all(promises).then(function () {
            console.log('promises done');
            body.push(null);
        }).catch(function (e) {
            console.log(e);
        });

        // co(function* () {
        //     yield sleep(3000);
        //     body.push(`
        //         <script>
        //             document.getElementById('content').innerHTML = 'Hello duoduo';
        //         </script>
        //     `);
        //     yield sleep(5000);
        //     body.push(`
        //         <div>发送完毕！</div>
        //     `);
        //     body.push(null);
        // }).catch(e => {
        //     console.log(e);
        // });

        /** replace the placeholder with real html */
        function end(html, name) {
            html = html.replace(/\r\n/gi,'');
            body.push(`
            <script id=${'componet_' + name}>
                bigpipe(\"${name}\",\"${html || "empty"}\");
            </script>
        `);
        }
    // }

}

function* renderTpl(body, item, url) {
    let name = item.name;
    let cb = item.cb;

    // if (!url) { return ""; }

    /** get template */
    let comTplPath = path.join(__dirname,'../', tplPath, body.tplFoler, name + '.ejs');
    let tplStr = yield readFile(comTplPath);
    let html = "";

    var t = Math.floor(Math.random() * 10) * 3000;

    try {
        html = ejs.render(tplStr, { data: t }, {
            filename: 'tpl/' + body.tplFoler + '/' + name
        });
        // html = yield render(body.tplFoler + "/" + name, { data: t });
    } catch (error) {
        html = '<pre>' + error.stack + '</pre>';
    }

    yield sleep(t);

    return html;

}


/**读取layout文件 */
function readFile(path) {
    return function (done) {
        fs.readFile(path, 'utf8', function (err, str) {
            if (err) return done(err);
            // remove extraneous utf8 BOM marker
            str = str.replace(/^\uFEFF/, '');
            done(null, str);
        });
    }
}
