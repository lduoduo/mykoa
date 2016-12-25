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
                canvas.draw(e.target.result);
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

var canvas = {
    canvas: null, //绘图canvas
    ctx: null, //绘图上下文
    image: null, //图片Image实例
    init: function () {
        this.canvas = $('.canvas')[0];
        // this.canvas.width = document.body.clientWidth;
        // this.canvas.height = document.body.clientHeight * 0.9;
        this.ctx = this.canvas.getContext('2d');
        this.initEvent();
        this.initHammer();
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
        var target = document.querySelector('.canvas');
        target.style.webkitTransition = 'all ease 0.05s';

        touch.on('.canvas', 'touchstart', function (ev) {
            ev.preventDefault();
        });

        var initialScale = 1;
        var currentScale;

        touch.on('.canvas', 'pinchstart', function (ev) {
            currentScale = ev.scale - 1;
            currentScale = initialScale + currentScale;
            currentScale = currentScale > 2 ? 2 : currentScale;
            currentScale = currentScale < 1 ? 1 : currentScale;
            this.style.webkitTransform = 'scale(' + currentScale + ')';

            ERROR.logtype = "touch";
            ERROR.log = "当前缩放比例为:" + currentScale + ".";
            alert(JSON.stringify(ERROR.log));
            ajax.post('/data/updateLog', ERROR);

            // log("当前缩放比例为:" + currentScale + ".");
        });

        touch.on('.canvas', 'pinchend', function (ev) {
            initialScale = currentScale;
        });

    },
    //加载图片获取图片数据
    loadImage: function (data) {
        var _ = this;
        if (!_.image) {
            _.image = new Image();
        }
        var image = _.image;
        image.onload = function () {

            _.draw();
        }

        image.src = data;
    },
    //使用canvas进行绘图
    draw: function (scale) {

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
            if (scale) {
                tmp.w = co.width * scale;
                tmp.h = co.height * scale;
                tmp.dx = (co.width - tmp.w) * 0.5;
                tmp.dy = (co.height - tmp.h) * 0.5;
                _.ctx.drawImage(image, tmp.dx, tmp.dy, tmp.w, tmp.h);

                return;
            }

            _.ctx.drawImage(image, 0, 0, _.canvas.width, _.canvas.height);
        }
    }

}

var touch = {
    data: {
        touch1: {},
        touch2: {}
    }, //touch位置数据
    init: function () {
        document.addEventListener("touchstart", this.touchStart, false);

        document.addEventListener("touchend", this.touchEnd, false);
    },
    touchStart: function () {
        event.preventDefault();
        var touches1 = event.touches[0];
        var touches2 = event.touches[1];
        var tmp1 = this.data.touch1;
        var tmp2 = this.data.touch2;
        tmp1.startX = touches1.pageX;
        tmp1.startY = touches1.pageY;
        tmp2.startX = touches2.pageX;
        tmp2.startY = touches2.pageY;
    },
    touchEnd: function () {
        event.preventDefault();
        var touches1 = event.changedTouches[0];
        var touches2 = event.changedTouches[1];
        var tmp1 = this.data.touch1;
        var tmp2 = this.data.touch2;

        tmp1.endX = touches1.pageX;
        tmp1.endY = touches1.pageY;
        tmp2.endX = touches2.pageX;
        tmp2.endY = touches2.pageY;

        var len1 = tmp1.endX-tmp1.startX;
        //写不下去了
        var lenX = this.data.endX - this.data.startX;
        var lenY = this.data.endY - this.data.startY;
    }
}
canvas.init();


