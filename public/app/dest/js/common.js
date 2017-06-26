FastClick.attach(document.body);

//弹窗插件配置
var Mt = {
    alert: function(option) {
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
    close: function() {
        swal.close();
    }
};