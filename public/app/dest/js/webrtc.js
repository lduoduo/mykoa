/** web rtc demo */
/**
 * 目前只支持2个client的p2p链接，即每个房间只支持2个人
 * 角色A: 第一个进入房间的人，处于等待状态，是p2p链接发起方
 * 角色B: 第二个进入房间的人，是配p2p链接接收方
 * 链接步骤：
 * 1. 角色成功加入房间(失败的时候另寻房间)
 * 2. 初始化本地媒体流
 *    - 检测是否有摄像头，是否支持
 *    - 获取本地视频流, navigator.getUserMedia
 *    - 初始化本地视频流信息, 以video标签进行渲染
 *    - 初始化本地p2p链接信息: new RTCPeerConnection(第三方STUN服务器配置信息);
 *    - 本地peer链接信息加入本地视频流进行渲染
 *    - 初始化本地peer的一系列事件
 *      - onicecandidate: 本地设置sdp时会触发, 生成保存自己的候选人信息
 *      - 通过服务器发送 candidate 给对方
 *      - onaddstream: 当有流过来时触发, 接收流并渲染
 * 3. 如果房间内人数为2，服务器通知房间里的A发起p2p连接请求
 * 4. A创建自己的链接邀请信息, 设置本地链接信息sdp, 通过服务器发送给B
 *    - createOffer: 创建本地链接信息
 *    - setLocalDescription: 将offer设置为本地链接信息sdp, 并且触发本地peer的onicecandidate事件
 * 4. server转发offer链接邀请信息给B, 触发B的onOffer方法进行处理
 *    - setRemoteDescription: 接收A的链接邀请，并设置A的描述信息, XXX.setRemoteDescription(new RTCSessionDescription(offer))
 *    - createAnswer: 创建回应，并存储本地的回应信息, 并将回应发送给server
 *    - setLocalDescription, 将自己的创建的answer设置为本地连接信息sdp, 触发自己的本地onicecandidate事件
 * 5. server转发候选人信息candidate, 触发B的onNewPeer(自定义的方法)
 *    - addIceCandidate: 将A的候选人信息加入自己本地, XXX.addIceCandidate(new RTCIceCandidate(candidate));
 * 6. A通过server接收B发出的answer, 触发自己的onAnswer
 *    - 设置B的描述信息, XXX.setRemoteDescription(new RTCSessionDescription(answer));
 * 7. AB链接建立完成, 开始传输实时数据
 */
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
    video: {
        // mandatory: {
        //     maxWidth: 640,
        //     maxHeight: 640
        // }
    },
    audio: true
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

var search = window.location.search;
search = search ? search.match(/roomId=\d+/gi) : "";
search = search ? search[0].replace(/roomId=/gi, '') : "";
//我的本地存储数据
var my = {
    roomId: search,
    //socket是否已经连接好，连接好后才能开启p2p连接
    isReady: false,
    list: [],
    addedlist: [],
    //我能连接的所有人
    connectors: {},
    //我自己的p2p连接信息
    connection: {},
    //我的音频输入设备
    audios: [],
    //我的视频输入设备
    videos: [],
    //我的视频流
    stream: null
};

var local = localStorage || window.localStorage; //本地存储
// ---------初始化启动socket, 创建socket链接-----------
/** 本地环境的socket协议和线上不一致，需要作区分 !!  */

var socket = null;
if (MY.environment == "dev") {
    socket = io('https://' + window.location.hostname + ':8098', { path: "/rtcSocket", query: 'roomId=' + my.roomId });
} else {
    socket = io.connect({ path: "/rtcSocket", query: 'roomId=' + my.roomId, "transports": ['websocket'] });
}





var rtc = {
    init: function() {
        this.initStatus();
        this.initSocket();
        this.join();
        this.initEvent();

    },
    initEvent: function() {
        var _ = this;
        // var shots = $('#snapshot')[0];
        $('body').on('click', '#snapshot', function(e) {
            if (my.stream) {
                cctx.drawImage(myvideo, 0, 0);
                $('#img')[0].src = canvas.toDataURL('image/webp');
            }
        });
        // video click
        $('body').on('click', '.video .item', function(e) {
            if (!$(e.target).hasClass('fixed')) {
                return;
            }
            $('.video .item').addClass('fixed');
            $(e.target).removeClass('fixed');
        });
        //video source change
        $('body').on('click', '.J-additional-inputs .item', function(e) {
            constraints.video.optional = [{ sourceId: $(e.target).data('id') }];
            _.initMedia();
        });

        //send msg button click
        $('body').on('click', '.J-send-msg', function(e) {
            var data = $('.J-msg-in').val();
            if (!data) { return; }
            my.dataChannel.send(data);
            $('.J-msg-in').val('');
            _.showMsg(data, true);
        });

        //clean msg button click
        $('body').on('click', '.J-clean-msg', function(e) {
            $('.J-msg').html('');
        });
    },
    //init local data
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
            //要加入的房间已满，重新选择房间
            if (sysMsg == 'error') {
                Mt.alert({
                    title: data,
                    confirmBtnMsg: '好',
                    cb: function() {
                        var id = Math.floor(Math.random() * 1000);
                        var tmp = window.location.href;
                        if (/roomid=\w+/.test(tmp)) {
                            tmp = tmp.replace(/roomid=\w+/, '');
                        }
                        window.location.href = tmp + '?roomid=' + id;
                    }
                });
                return;
            }
            my.isReady = true;
            local.setItem('myinfo', JSON.stringify(data));
            my.info = data;
            console.log('欢迎您加入');
            _.mstlist();

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
    //发送文字消息
    sendMsg: function(msg) {
        socket.send(my.info, msg);
    },
    //p2p连接的消息传递
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
    //加入房间
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
        my.connection = new RTCPeerConnection(iceServer);
        // my.connection = new RTCPeerConnection(iceServer, { optional: [{ RtpDataChannels: true }] });


        my.connection.addStream(stream);
        /** 视频流传递 */
        my.connection.onaddstream = function(e) {
            console.log(e);
            // var video = document.createElement('video');
            uvideo.src = window.URL.createObjectURL(e.stream);
            // $('body').append(video);
            // my.connectors
        };
        /** 设置本地sdp后触发该事件，发送自己的candidate */
        my.connection.onicecandidate = function(e) {
            if (e.candidate) {
                my.candidate = e.candidate;
                _.send('candidate', e.candidate);
            }
        };

        my.connection.oniceconnectionstatechange = function(e) {
            console.log('iceConnectionState: ' + my.connection.iceConnectionState);
            if (my.dataChannel) {
                console.log('data channel state: ' + my.dataChannel.readyState);
            }

        };

        /** 对接收方的数据传递设置 */
        my.connection.ondatachannel = function(e) {
            console.log('Data channel is created!');

            my.dataChannel = e.channel;

            _.onDataChannel();

        };

        //做好连接准备后，发送消息给服务器，通知对方发送P2P连接邀请
        _.send('ready', my.info);
    },
    /** 消息接收处理 */
    onDataChannel: function() {
        var _ = this;
        my.dataChannel.onopen = function() {
            console.log('dataChannel opened');
        };
        my.dataChannel.onerror = function(error) {
            console.log("Error:", error);
        };
        my.dataChannel.onmessage = function(data) {
            console.log(data);
            _.showMsg(data.data);
        };
    },
    /** 将对方加入自己的候选者中 */
    onNewPeer: function(data) {
        var candidate = data.data;
        my.connection.addIceCandidate(new RTCIceCandidate(candidate));

        //增加一个元素
        // my.connectors = document.createElement('video');
        // $('body').append(video);
    },
    /** 接收链接邀请，发出响应 */
    onOffer: function(data) {
        var _ = this;
        var offer = data.data;
        my.connectors[data.user.id] = data.user.name;
        my.connection.setRemoteDescription(new RTCSessionDescription(offer), function() {

            my.connection.createAnswer(function(_answer) {
                my.connection.setLocalDescription(_answer);
                _.send('answer', _answer);
            }, function(err) {
                console.log('An error occur on onOffer.' + err);
            });
        });
    },
    /** 接收响应，设置远程的peer session */
    onAnswer: function(data) {
        var answer = data.data;
        my.connection.setRemoteDescription(new RTCSessionDescription(answer));
    },
    /** 对方离开，断开链接 */
    onLeave: function(user) {
        delete my.connectors[user.id];
        my.connection.close();
        my.connection.onicecandidate = null;
        my.connection.onaddstream = null;
        this.setupPeerConnection(my.stream);
    },
    /** 开始连接, 发出链接邀请 */
    startPeerConnection: function() {
        var _ = this;

        //创建数据流信道, 不能一开始就创建，这样有问题, 而且顺序必须在createOffer之前
        my.dataChannel = my.connection.createDataChannel("sendDataChannel", { reliable: false });
        _.onDataChannel();

        my.connection.createOffer(function(_offer) {
            my.offer = _offer;
            console.log('offer:' + JSON.stringify(_offer));
            _.send('offer', _offer);
            my.connection.setLocalDescription(_offer);
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
        // myvideo.play();

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
        var _ = this;
        if (typeof MediaStreamTrack === "undefined") {
            Mt.alert({
                type: 'error',
                title: '当前设备不支持视频功能',
                timer: 2000
            });
            return;
        }
        MediaStreamTrack.getSources(function(sourceInfo) {
            if (sourceInfo.length == 0) {
                Mt.alert({
                    type: 'error',
                    title: '未找到任何视频输入设备',
                    timer: 2000
                });
                return;
            }
            var test = "";
            for (var i = 0; i < sourceInfo.length; i++) {
                var tmp = sourceInfo[i];
                if (tmp.kind == "audio") {
                    my.audios.push(tmp);
                }
                if (tmp.kind == "video") {
                    my.videos.push(tmp);
                }
            }
            _.showInputs();
        });
    },
    //如果有多个视频音频输入，屏幕上进行展示
    showInputs: function() {
        var inputsEL = document.createElement('div');
        inputsEL.className = "item additional-inputs J-additional-inputs";
        var html = "";
        var tmp = null;
        tmp = my.videos[0];
        constraints.video.optional = [{ sourceId: tmp.id }];
        this.initMedia();

        // if(my.videos.length <= 1){return;}
        for (var i = 0; i < my.videos.length; i++) {
            tmp = my.videos[i];
            html += "<div class='item' data-id='" + tmp.id + "'>camara" + i + "</div>";
        }

        // for (var i = 0; i < my.audios.length; i++) {
        //     tmp = my.audios[i];
        //     html += "<div class='item' data-id='" + tmp.id + "'>" + tmp.label + "</div>";
        // }
        $(inputsEL).html(html);
        $('.J-btn-group').append(inputsEL);
    },
    //显示聊天信息
    showMsg: function(data, isSelf) {
        var className = isSelf ? "right" : "left";

        // console.log('msg from :' + JSON.stringify(user));
        var message = "<li class='" + className + " item'><span class='msg'>" + data + "</span></li>";

        $('.J-msg').append(message);
        //append dom as first child
        // $('.J-msg').prepend(message);
        // 滚动条保持最下方
        $('.J-msg').scrollTop($('.J-msg')[0].scrollHeight);

    }

}

rtc.init();

function hasRTCPeerConnection() {
    window.RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
    window.RTCSessionDescription = window.RTCSessionDescription || window.webkitRTCSessionDescription || window.mozRTCSessionDescription;
    window.RTCIceCandidate = window.RTCIceCandidate || window.webkitRTCIceCandidate || window.mozRTCIceCandidate;
    return !!window.RTCPeerConnection;
}
