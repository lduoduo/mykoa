FastClick.attach(document.body);

/*
 * zxxFile.js 基于HTML5 文件上传的核心脚本 http://www.zhangxinxu.com/wordpress/?p=1923
 * by zhangxinxu 2011-09-12
 */

var ZXXFILE = {
    fileInput: null, //html file控件
    dragDrop: null, //拖拽敏感区域
    upButton: null, //提交按钮
    isMultiple: false, // 是否多文件上传
    url: "", //ajax地址
    fileFilter: [], //过滤后的文件数组
    fileFilterObj: {}, //过滤后的文件对象集合，用户去重过滤
    filter: function (files) { //选择文件组的过滤方法
        return files;
    },
    onSelect: function () { }, //文件选择后
    onDelete: function () { }, //文件删除后
    onDragOver: function () { }, //文件拖拽到敏感区域时
    onDragLeave: function () { }, //文件离开到敏感区域时
    beforeUpload: function () { }, //文件上传之前的验证
    onProgress: function () { }, //文件上传进度
    onSuccess: function () { }, //文件上传成功时
    onFailure: function () { }, //文件上传失败时,
    onComplete: function () { }, //文件全部上传完毕时

    /* 开发参数和内置方法分界线 */

    //文件拖放
    funDragHover: function (e) {
        e.stopPropagation();
        e.preventDefault();
        this[e.type === "dragover" ? "onDragOver" : "onDragLeave"].call(e.target);
        return this;
    },
    //获取选择文件，file控件或拖放
    funGetFiles: function (e) {
        // 取消鼠标经过样式
        this.funDragHover(e);

        // 获取文件列表对象
        var files = e.target.files || e.dataTransfer.files;
        //继续添加文件
        var tmp = this.filter(files, this.fileFilterObj);

        this.fileFilter = this.isMultiple ? this.fileFilter.concat(tmp.list) : tmp.list;
        this.fileFilterObj = tmp.obj;
        tmp.list.length > 0 &&  this.funDealFiles();
        return this;
    },

    //选中文件的处理与回调
    funDealFiles: function () {
        for (var i = 0, file; file = this.fileFilter[i]; i++) {
            //增加唯一索引值
            file.index = i;
        }
        //执行选择回调
        this.onSelect(this.fileFilter);
        return this;
    },

    //删除对应的文件
    funDeleteFile: function (name) {
        for (var i = 0; i < this.fileFilter.length; i++) {
            if (this.fileFilter[i].name == name) {
                index = i;
                this.fileFilter.splice(i, 1);
                break;
            }
        }
        delete this.fileFilterObj[name];
        this.onDelete(name);
    },

    //文件上传
    funUploadFile: function () {
        var self = this;
        if (location.host.indexOf("sitepointstatic") >= 0) {
            //非站点服务器上运行
            return;
        }
        if (!this.beforeUpload(this.fileFilterObj)) {
            return;
        }
        this.ajaxFile(this.fileFilter);
    },

    init: function () {
        var self = this;

        if (this.dragDrop) {
            this.dragDrop.addEventListener("dragover", function (e) {
                self.funDragHover(e);
            }, false);
            this.dragDrop.addEventListener("dragleave", function (e) {
                self.funDragHover(e);
            }, false);
            this.dragDrop.addEventListener("drop", function (e) {
                self.funGetFiles(e);
            }, false);
        }

        //文件选择控件选择
        if (this.fileInput) {
            this.fileInput.addEventListener("change", function (e) {
                self.funGetFiles(e);
            }, false);
        }

        //上传按钮提交
        if (this.upButton) {
            this.upButton.addEventListener("click", function (e) {
                self.funUploadFile(e);
            }, false);
        }
    },
    ajaxFile: function (files) {
        if ($('#projectname').val() == '') {
            this.onError('项目名不能为空');
            return false;
        }
        var _this = this;
        var fd = new FormData();
        fd.append('name', $('#projectname').val() || 'test');
        for (var i = 0; i < files.length; i++) {
            fd.append('file', files[i]);
        }
        // fd.append('file', $('#multipleUpload')[0].files);

        $.ajax({
            url: _this.url,
            type: 'POST',
            data: fd,
            processData: false, //此处指定对上传数据不做默认的读取字符串的操作
            contentType: false, //此处指定对上传数据不做默认的读取字符串的操作
            success: function (data) {
                _this.fileFilter = [];
                _this.fileFilterObj = {};
                _this.onSuccess(data);
                // console.log(data);
            },
            error: function (e) {
                console.log(e);
            }
        });
    }
};