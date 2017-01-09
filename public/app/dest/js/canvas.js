/** canvas demo for AR  */

//弹窗插件配置
var Mt = {
    alert: function (option) {
        //type, title, msg, btnMsg, cb, isLoading
        swal({
            title: option.title,
            text: option.msg,
            type: option.type,
            showConfirmButton: !!option.confirmBtnMsg,
            showCancelButton: !!option.cancelBtnMsg,
            cancelButtonText: option.cancelBtnMsg || "在犹豫一下",
            confirmButtonColor: "#DD6B55",
            confirmButtonText: option.confirmBtnMsg || "好哒",
            showLoaderOnConfirm: option.isLoading,
            timer: option.timer,
            closeOnConfirm: false,
            html: option.html
        }, option.cb);
    },
    close: function () {
        swal.close();
    }
};

var params = {
    fileInput: $('.J-upload')[0],
    // dragDrop: $("#drag")[0],
    // upButton: $("#uploadBtn")[0],
    url: '/upload',
    //list为已经上传的文件
    filter: function (files, listobj) {
        var file = files[0];
        var errors = '';

        if (!/\.(png|jpeg|jpg)$/i.test(file.name)) {
            errors = "只能上传图片格式的文件";
            files = [];
        }

        if (errors) {
            Mt.alert({
                title: '呃。。。！',
                type: 'error',
                msg: errors,
                confirmBtnMsg: '好'
            });
        }
        return {
            list: files,
            obj: listobj
        }
    },
    onSelect: function (files) {
        files = files[0];

        if (files) {
            var reader = new FileReader();
            reader.onload = function (e) {
                canvas.loadImage(e.target.result, files);
            }
            reader.readAsDataURL(files);
        }

    },
    onError: function (msg) {
        Mt.alert({
            type: 'error',
            title: msg
        });
    }
};
ZXXFILE = $.extend(ZXXFILE, params);
ZXXFILE.init();

//用户上传的图片由URL.createObjectURL生成的URL指向
var imgObjectURL = "";

//图片操作相关的数据
var imgData = {
    //图像的尺寸
    origin: {
        width: 0,
        height: 0
    },

    //缩放比例 默认为1
    scale: 1,

    //偏移量
    move: {
        x: 0,
        y: 0
    },

    //临时缩放比例
    tempScale: 0,

    //临时缩放偏移量,用于用户操作相关的计算
    tempMove: {
        x: 0,
        y: 0
    }

};
//默认值，用于清空
var imgDataDefault = $.extend({}, imgData);

var canvas = {
    scale: 1, //初始缩放比
    canvas: null, //绘图canvas
    ctx: null, //绘图上下文
    image: null, //图片Image实例
    init: function () {
        this.canvas = $('.canvas')[0];
        // this.canvas.width = document.body.clientWidth;
        // this.canvas.height = document.body.clientHeight * 0.9;
        this.ctx = this.canvas.getContext('2d');

        this.initHammer();
        this.initEvent();
    },
    initEvent: function () {
        $('body').on('click', '.J-btn-upload', function () {
            $('.J-upload').click();
        });
        // $('.J-upload').on('change', function (e) {

        // });
    },
    //初始化手势监控
    initHammer: function () {
        //将当前环境传递进去
        touch.init($('.box')[0], this.draw, this);
    },
    //加载图片获取图片数据
    loadImage: function (data, file) {
        var _ = this;
        if (!_.image) {
            _.image = new Image();
        }
        var image = _.image;

        //释放上个图片的资源
        if (imgObjectURL) {
            window.URL.revokeObjectURL(imgObjectURL);
        }
        //生成图片的URL
        imgObjectURL = window.URL.createObjectURL(file);

        //显示图片
        $("#pictureUpload-bg").css("backgroundImage", "url(\"" + imgObjectURL + "\")");

        //储存原图片的尺寸
        image.onload = function () {

            imgData.origin.width = image.width;
            imgData.origin.height = image.height;

            // _.draw();
        }

        image.src = data;
    },
    //使用canvas进行绘图
    draw: function (env, option) {
        var _ = env || this;
        option = option || {};

        if (option.scale) {
            _.scale = option.scale;
            ERROR.logtype = "scale";
            ERROR.log = "scale: " + option.scale;
            ajax.post('/data/updatelog', ERROR);
        }

        if (option.move) {

            _.move = option.move;
            ERROR.logtype = "move";
            ERROR.log = "move: " + _.move.x + ", " + _.move.y;
            // ajax.post('/data/updatelog', ERROR);
        }
        if (!_.image) { return; }

        _.ctx.clearRect(0, 0, _.canvas.width, _.canvas.height);
        _.ctx.beginPath();

        var tmp = {};
        var image = _.image;
        var co = _.canvas;
        var w = image.width, h = image.height;

        co.width = document.body.clientWidth;
        co.height = document.body.clientHeight;

        //按照长宽比等比例自适应屏幕
        if (image.width != 0) {
            var scale1 = image.width / image.height;
            var scale2 = co.width / co.height;
            if (scale1 >= scale2) {
                co.height = image.height * co.width / image.width;
                image.style.width = '100%';
                image.style.height = 'auto';
                co.style.marginLeft = '-' + co.width / 2 + 'px';
                co.style.marginTop = '-' + co.height / 2 + 'px';
            }
            else {
                co.width = image.width * co.height / image.height;
                image.style.height = '100%';
                image.style.width = 'auto';
                co.style.marginLeft = '-' + co.width / 2 + 'px';
                co.style.marginTop = '-' + co.height / 2 + 'px';
            }

            //带缩放系数的画图
            if (_.scale) {

                tmp.w = co.width * _.scale;
                tmp.h = co.height * _.scale;
                tmp.dx = (co.width - tmp.w) * 0.5;
                tmp.dy = (co.height - tmp.h) * 0.5;

                // if (_.move) {
                //     _.ctx.drawImage(image, _.move.x, _.move.y, _.canvas.width, _.canvas.height, tmp.dx, tmp.dy, tmp.w, tmp.h);//原图像到目标图像
                //     return;
                // }

                _.ctx.drawImage(image, tmp.dx, tmp.dy, tmp.w, tmp.h);

                return;
            }


            _.ctx.drawImage(image, 0, 0, _.canvas.width, _.canvas.height);
        }
    }

}

var touch = {
    $uploadBg: $('#pictureUpload-bg'),
    data: {
        r: null, //缩放比
        touch1: {},
        touch2: {}
    }, //touch位置数据
    init: function (el, cb, env) {
        el.addEventListener("touchstart", this.touchStart, false);
        el.addEventListener("touchmove", this.touchEnd, false);
        el.addEventListener("touchend", this.touchEnd, false);
        this.cb = cb;
        this.env = env;
    },
    touchStart: function (event) {
        var _ = touch;
        event.preventDefault();

        imgData.tempScale = event.scale;

        // alert(event.scale);

        var touches1 = event.touches[0];
        var tmp1 = _.data.touch1;
        tmp1.startX = touches1.pageX;
        tmp1.startY = touches1.pageY;

        if (event.touches.length <= 1) return;

        var touches2 = event.touches[1];
        var tmp2 = _.data.touch2;
        tmp2.startX = touches2.pageX;
        tmp2.startY = touches2.pageY;

        ERROR.logtype = "touch";
        ERROR.log = "touchstart scale: " + JSON.stringify(event.scale);
        ajax.post('/data/updatelog', ERROR);
    },
    touchEnd: function (event) {
        var _ = touch;
        event.preventDefault();
        if (event.changedTouches.length <= 1) {
            _.move(event);
            return;
        }
        _.scale(event);
    },
    move: function (event) {
        var _ = this;

        var touches1 = event.changedTouches[0];
        var tmp1 = _.data.touch1;
        tmp1.endX = touches1.pageX;
        tmp1.endY = touches1.pageY;
        var move = {
            x: tmp1.endX - tmp1.startX,
            y: tmp1.endY - tmp1.startY
        };

        // var x = event.center.x;
        // var y = event.center.y;

        // var px = x - imgData.tempMove.x;
        // var py = y - imgData.tempMove.y;

        // imgData.move.x = imgData.move.x + px
        // imgData.move.y = imgData.move.y + py

        // imgData.tempMove.x = x;
        // imgData.tempMove.y = y;

        _.$uploadBg.css({
            left: move.x + "px",
            top: move.y + "px"
        });


    },
    scale: function (event) {
        var _ = this;

        imgData.scale = event.scale - imgData.tempScale + imgData.scale;
        imgData.scale = imgData.scale <= 0.01 ? 0.01 : imgData.scale;
        imgData.tempScale = event.scale;
        _.$uploadBg.css("transform", "scale(" + imgData.scale + "," + imgData.scale + ")");


        // var touches1 = event.changedTouches[0];
        // var touches2 = event.changedTouches[1];
        // var tmp1 = _.data.touch1;
        // var tmp2 = _.data.touch2;

        // tmp1.endX = touches1.pageX;
        // tmp1.endY = touches1.pageY;
        // tmp2.endX = touches2.pageX;
        // tmp2.endY = touches2.pageY;

        // // var x1 = Math.abs(tmp1.endX - tmp1.startX);
        // // var y1 = Math.abs(tmp1.endY - tmp1.startY);

        // // var x2 = Math.abs(tmp2.endX - tmp2.startX);
        // // var y2 = Math.abs(tmp2.endY - tmp2.startY);

        // // var len1 = Math.sqrt(x1 * x1 + y1 * y1);
        // // var len2 = Math.sqrt(x2 * x2 + y2 * y2);

        // //原始距离
        // var x0 = Math.abs(tmp1.startX - tmp2.startX);
        // var y0 = Math.abs(tmp2.startY - tmp2.startY);
        // var len0 = Math.sqrt(x0 * x0 + y0 * y0);

        // //目标距离
        // var x = Math.abs(tmp1.endX - tmp2.endX);
        // var y = Math.abs(tmp2.endY - tmp2.endY);
        // var len = Math.sqrt(x * x + y * y);

        // //缩放的距离比
        // var r = len / len0;

        // _.cb && _.cb(_.env, {
        //     scale: r <= 0.01 ? 0.01 : r
        // });
    }
}

canvas.init();


