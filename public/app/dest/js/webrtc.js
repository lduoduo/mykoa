/** web rtc demo */

navigator.getUserMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia;


window.AudioContext = window.AudioContext || webkitAudioContext;
var actx = new AudioContext();

var canvas = document.createElement('canvas');
canvas.width = 320; canvas.height = 240;
var cctx = canvas.getContext('2d');

var myvideo = document.querySelector('#myrtc');
var uvideo = document.querySelector('#urtc');

var constraints = {
    audio:true,
    video: {

        mandatory: {
            maxWidth: 320,
            maxHeight: 240
        }
    },
    audio: false
};

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
            confirmButtonText: option.btnMsg || "好哒",
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

var local = localStorage || window.localStorage; //本地存储
// ---------创建连接-----------
var socket = io('https://' + window.location.hostname + ":" + MY.ioPort); //初始化启动socket

//我的本地存储数据
var my = {
    list: [],
    addedlist: [],
    //我能连接的所有人
    connections: {},
    stream: null//我的视频流
};
var myconnect = {};

var rtc = {
    init: function() {
        this.initStatus();
        this.initSocket();
        this.join();

        this.initEvent();
        this.initMedia();
    },
    initEvent: function() {
        var _this = this;
        // var shots = $('#snapshot')[0];
        $('body').on('click', '#snapshot', (e) => {
            console.log(e);
            if (my.stream) {
                cctx.drawImage(myvideo, 0, 0);
                $('#img')[0].src = canvas.toDataURL('image/webp');
            }
        })
        // shots.addEventListener('click', (e) => {
        //     console.log(e);
        //     if (_this.stream) {
        //         cctx.drawImage(video, 0, 0);
        //         $('#img').src = canvas.toDataURL('image/webp');
        //     }
        // });
    },
    //init local camara
    initStatus: function() {
        my.info = JSON.parse(local.getItem('myinfo') || null);
    },

    //初始化socket的各种监听事件
    initSocket: function() {
        var _ = this;
        // 加入房间
        socket.on('connect', function() {
            console.log('heart beat...');
        });
        // 监听消息
        socket.on('msg', function(user, msg) {
            // s.showMsg(user, msg);
            console.log(msg);
        });

        // 监听系统消息
        socket.on('sys', function(sysMsg, data) {

            if (sysMsg == "in") {
                // console.log(data);
                Mt.alert({
                    title: data.id + "来了",
                    timer: 1000
                });
                my.addedlist.push(data);
            }
            if (sysMsg == "out") {
                _.onLeave(data);
            }
            console.log(my);
        });

        // 监听自己的消息
        socket.on('self', function(sysMsg, data) {
            console.log('my');
            local.setItem('myinfo', JSON.stringify(data));
            my.info = data;
            console.log(data);
        });

        /** 和peer有关的监听 */
        socket.on('peer', function(data) {

            console.log(data);
            switch (data.type) {
                case "candidate": _.onNewPeer(data.data); break;
                case "offer": _.onOffer(data.data); break;
                case "peerStart": _.startPeerConnection(); break;
                case "answer": _.onAnswer(data.data); break;
            };
        });

    },
    //发送消息
    sendMsg: function(msg) {
        socket.send(my.info, msg);
    },
    //发送链接请求
    send: function(type, data) {
        socket.emit('peer', {
            type: type,
            data: {
                user: my.info,
                data: data
            }
        });
    },
    //离开房间
    leave: function() {
        socket.emit('leave');
    },
    //join 房间
    join: function() {
        socket.emit('join', my.info);
    },
    /** init media */
    initMedia: function() {
        var _this = this;
        if (navigator.getUserMedia) {
            // 支持
            navigator.getUserMedia(constraints, function(stream) {
                _this.loadStream(_this, stream);
                _this.initPeerConnection(stream);
            }, _this.err);

        } else {
            Mt.alert({
                title: "web rtc not supported",
                timer: 1000
            });
        }
    },
    //init connection
    initPeerConnection: function(stream) {
        if (!hasRTCPeerConnection()) {
            Mt.alert({
                title: "web rtc not supported for connection",
                timer: 1000
            });
            return;
        }
        this.setupPeerConnection(stream);
    },
    setupPeerConnection: function(stream) {
        var _ = this;
        //Google的STUN服务器：stun:stun.l.google.com:19302 ??
        var iceServer = {
            "iceServers": [{
                "url": "stun:173.194.202.127:19302"
            }]
        };
        //创建PeerConnection实例
        myconnect = new RTCPeerConnection(iceServer);
        myconnect.addStream(stream);
        myconnect.onaddstream = function(e) {
            console.log(e);
            // var video = document.createElement('video');
            uvideo.src = window.URL.createObjectURL(e.stream);
            // $('body').append(video);
            // my.connections
        };
        /** 接收到邀请，准备处理对方的验证信息 */
        myconnect.onicecandidate = function(e) {
            if (e.candidate) {
                my.candidate = e.candidate;
                _.send('candidate', e.candidate);
            }
        };
    },
    /** 将对方加入自己的候选者中 */
    onNewPeer: function(data) {
        var candidate = data.data;
        myconnect.addIceCandidate(new RTCIceCandidate(candidate));

        //增加一个元素
        // my.connections = document.createElement('video');
        // $('body').append(video);
    },
    /** 接收链接邀请，发出响应 */
    onOffer: function(data) {
        var _ = this;
        var offer = data.data;
        my.connections[data.user.id] = data.user.name;
        myconnect.setRemoteDescription(new RTCSessionDescription(offer), function() {
            myconnect.createAnswer(function(_answer) {
                myconnect.setLocalDescription(_answer);
                _.send('answer', _answer);
            }, function(err) {
                console.log('An error occur on onOffer.' + err);
            });
        });
    },
    /** 接收响应，设置远程的peer session */
    onAnswer: function(data) {
        var answer = data.data;
        myconnect.setRemoteDescription(new RTCSessionDescription(answer));
    },
    /** 对方离开，断开链接 */
    onLeave: function(user) {
        delete my.connections[user.id];
        myconnect.close();
        myconnect.onicecandidate = null;
        myconnect.onaddstream = null;
        this.setupPeerConnection(my.stream);
    },
    /** 开始连接, 发出链接邀请 */
    startPeerConnection: function() {
        var _ = this;
        myconnect.createOffer(function(_offer) {
            my.offer = _offer;
            console.log('offer:' + JSON.stringify(_offer));
            _.send('offer', _offer);
            myconnect.setLocalDescription(_offer);
        }, function(error) {
            Mt.alert({
                title: "An error on startPeerConnection:" + error,
                timer: 1000
            });
        });
    },
    /** video视频呈现媒体流 */
    loadStream: function(ctx, stream) {
        console.log(stream);
        my.stream = stream;
        // var video = document.createElement('video');


        if (window.URL) {
            myvideo.src = window.URL.createObjectURL(stream);
        } else {
            myvideo.src = stream;
        }
        // myvideo.autoplay = true;
        //or
        myvideo.play();

        myvideo.onloadedmetadata = function(e) {
            console.log("Label: " + stream.label);
            console.log("AudioTracks", stream.getAudioTracks());
            console.log("VideoTracks", stream.getVideoTracks());
        };

        // var audioInput = actx.createMediaStreamSource(stream);
        // audioInput.connect(actx.destination);

    },
    err: function(e) {
        console.log(e);
    },
    //获取摄像头和麦克风的列表
    mstlist: function() {
        MediaStreamTrack.getSources(function(sourceInfo) {
            var audioSource = null;
            var videoSource = null;
            console.log(sourceInfo);
            // for( let i=0;i!=sourceInfo.length;i++){

            // }
        });
    }

}

rtc.init();

function hasRTCPeerConnection() {
    window.RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
    window.RTCSessionDescription = window.RTCSessionDescription || window.webkitRTCSessionDescription || window.mozRTCSessionDescription;
    window.RTCIceCandidate = window.RTCIceCandidate || window.webkitRTCIceCandidate || window.mozRTCIceCandidate;
    return !!window.RTCPeerConnection;
}
