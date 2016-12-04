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

var config = require('../../../config');
var render = require('../render');


const viewPath = '../../views/';
const tplPath = '../../tpl/';

module.exports = class View extends Readable {
    /** why need ctx here? we need pass in common variables in koa to use */
    constructor(option, ctx) {

        super();

        this.data = {

            /** states of server */
            state: ctx.state,
            /** querystring object of request */
            query: ctx.query,
            staticPaths: 'localhost:8090', //hardcode for now
            config: config

        };

        this.components = [];
        /** render tpls in order, need pointer as index number */
        this.pointer = this.components.length;

        /** set page folder and tpl folder */
        let fd = this.folder = {};
        if (typeof option == "String") {
            fd.view = fd.tpl = option;
        } else if (option instanceof 'Object') {
            fd.view = option.view;
            fd.tpl = option.tpl || option.view;
        } else {
            new Error('invalid param for option in bp.js');
            return;
        }
        if (!fd.view) {
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
    render(){

        var body = this;

        return function* (){
            /** render page view */
            var content = yield render(body.pageName, body.data);

            body.push(content);

            /** render tpl components*/

        }
    }
}

function renderComponents(){
    co(function *(){
        yield sleep(2000);

    })
}