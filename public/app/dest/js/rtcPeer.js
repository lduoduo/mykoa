/**
 * 建立rtc连接
 * 功能：通过rtc帮助传输媒体流和data数据
 * 调用方式：
 * 1. 新建实例 var rtc = new rtcPeer()
 * 2. 初始化，可以传入媒体流或者data数据，可选
 *      rtc.init({
 *          url: 信令服务器地址，必填
 *          mediastream: 媒体流，可选
 *          data: 自定义data数据，可选
 *      }).then(supportedListeners=>{
 *          console.log('支持的事件注册列表:',supportedListeners)
 *      })
 *    初始化成功之后，会有属性标志位:inited:true
 * 3. 添加回调监听函数
 *      rtc.on('stream', function (mediastream) {
 *          console.log(mediastream)
 *      }.bind(this))
 *      rtc.on('data', function (data) {
 *          console.log(data)
 *      }.bind(this))
 *      // 连接成功回调
 *      rtc.on('ready', function (obj) {
 *          let {status, error, wss} = obj
 *          status: 连接成功失败的状态
 *          console.log(obj)
 *      }.bind(this))
 *      // 远程断开监听
 *      rtc.on('stop', function (obj) {
 *          console.log(obj)
 *      }.bind(this))
 * 4. 可调用的方法
 *      - rtc.updateStream(stream) // 更新流，用新的流代替旧的流，如果不传参，代表销毁流
 *      - rtc.updateData(data) // 传递自定义数据，目前没有任何限制
 */


function rtcPeer() {
    this.rtcConnection = null;
    this.stream = null;
    this.inited = false;
    this.supportedListeners = {
        'ready': '连接成功的回调',
        'stream': '收到远端流',
        'data': '收到远端datachannel数据',
        'stop': '远端断开'
    }
    // 回调监听
    this.listeners = {}

    this.duoduo_signal = {
        ws: null,
        inited: false,
        // 回调监听
        listeners: {},
        init(address) {
            !this.inited && this.initSignal(address)
        },
        // 注册监听回调事件
        on(name, fn) {
            this.listeners[name] = fn
        },
        initSignal(address) {
            let that = this;
            this.ws = address;
            var ws = this.ws = new WebSocket(address);

            ws.onopen = function () {
                that.inited = true
                that.join();
                console.log("websocket connected");
            };
            ws.onmessage = function (e) {
                let data = e.data || null
                data = JSON.parse(data)
                console.log(data);
                switch (data.type) {
                    case "self": that.onSelf(data.data); break;
                    case "sys": that.onsys(data.data); break;
                    case "peer": that.onPeer(data.data); break;
                };
            };
            ws.onclose = function () {
                that.inited = false
                console.log('Connection lost');
            };

            // 缓存原始send方法
            let send = ws.send;
            // 包装send方法
            ws.send = function (data) {
                // send.call(this, data);
                send.call(this, JSON.stringify(data));
                // console.log(data)
                console.log(`websocket send: ${data.type}`, data.data);
            };
        },
        // 重置状态
        reset() {
            this.inited = false
            this.ws.onopen = null
            this.ws.onmessage = null
            this.ws.onerror = null
            this.ws.onclose = null
            if (this.ws.readyState === WebSocket.OPEN) {
                this.ws.close()
            }
            this.ws = null
            this.listeners = {}
        },
        // 发给自己的消息
        onSelf(data) {
            // 是否是join事件
            if (data.type === 'join') {
                console.log(`join room ${data.code === 200 ? 'success' : 'failed'}`)
                if (data.code === 200) {
                    this.listeners['connected'] && this.listeners['connected']({
                        status: true,
                        wss: this.ws.url
                    })
                    this.user = data.user
                    return
                }
                this.listeners['connected'] && this.listeners['connected']({
                    status: false,
                    error: data.error
                })
            }
        },
        // 系统消息
        onsys(data) {
            // 如果有人加入则开始rtc连接
            if (data.code === 200 && data.type === 'in') {
                this.listeners['start'] && this.listeners['start']()
            }
            // 有人退出就断开rtc连接
            if (data.code === 200 && data.type === 'out') {
                this.listeners['stop'] && this.listeners['stop'](data.data)
            }
        },
        // peer消息
        onPeer(data) {
            // let {type, data} = data
            if (!data.type) return
            this.listeners[data.type] && this.listeners[data.type](data.data)
        },
        // 给服务端发送peer消息
        send(type, data) {
            data = {
                type: 'peer',
                data: {
                    type,
                    data
                }
            }
            this.ws.send(data);
        },
        join() {
            this.ws.send({
                type: 'join'
            })
        },
        sendPeer() {
            this.ws.send({
                type: 'peer',
                data: {
                    status: 'ready',
                    data: 222
                }
            })
        },
        stop() {
            if (!this.ws) return
            this.ws.send({
                type: 'leave',
                data: this.user
            })
            this.reset();
        }
    }
}


let fn = rtcPeer.prototype

// 注册监听回调事件
fn.on = function (name, fn) {
    this.listeners[name] = fn
}

// 初始化入口
fn.init = function (option = {}) {
    let { url, stream, data} = option
    if (!url) return Promise.reject('缺少wss信令地址')
    this.stream = stream;
    this.data = data;

    this.duoduo_signal.init(url);
    if (this.inited) {
        this.updateStream()
        return Promise.reject('请勿重复开启rtc连接')
    }
    this.duoduo_signal.on('connected', this.connected.bind(this))
    this.duoduo_signal.on('start', this.start.bind(this))
    this.duoduo_signal.on('stop', this.stop.bind(this))
    this.duoduo_signal.on('candidate', this.onNewPeer.bind(this))
    this.duoduo_signal.on('offer', this.onOffer.bind(this))
    this.duoduo_signal.on('answer', this.onAnswer.bind(this))

    return Promise.resolve(this.supportedListeners)
}
// 断开连接, 进行销毁工作
fn.stop = function (data) {
    if (!this.inited) return
    this.listeners['stop'] && this.listeners['stop'](data)

    if (this.dataChannel) this.dataChannel.close()
    if (this.rtcConnection) this.rtcConnection.close()

    this.rtcConnection = null
    this.dataChannel = null

    this.duoduo_signal.stop()

    let stream = this.stream
    if (stream) {
        stream.getTracks().forEach(function (track) {
            track.stop()
            stream.removeTrack(track)
        })
    }
    this.stream = null
    this.listeners = {}
    this.inited = false
}
fn.connected = function (option = {}) {
    let {status, wss, error} = option
    if (status) {
        this.setup(wss)
        return
    }
    this.listeners['ready'] && this.listeners['ready']({ status: false, error })
}
// 初始化rtc连接，做准备工作
fn.setup = function (wss) {
    let rtcConnection;
    if (navigator.mozGetUserMedia) {
        rtcConnection = this.rtcConnection = new RTCPeerConnection();
    } else {
        rtcConnection = this.rtcConnection = new RTCPeerConnection(null, {
            optional: [{
                googCpuOveruseDetection: false
            }]
        });
    }

    console.log('setup peerconnection')
    /** 初始化成功的标志位 */
    this.inited = true;

    let stream = this.stream
    if (stream) {
        // stream.getTracks().forEach((track) => {
        //     rtcConnection.addTrack(track, stream)
        // })
        rtcConnection.addStream(stream)
        console.log('attach stream:', stream)
    }

    // 开启datachannel通道
    this.dataChannel = rtcConnection.createDataChannel("ldodo", { negotiated: true, id: 0 });
    this.onDataChannel();


    this.initPeerEvent();

    this.listeners['ready'] && this.listeners['ready']({ status: true, url: wss })
}
// 初始化注册peer系列监听事件
fn.initPeerEvent = function () {
    let rtcConnection = this.rtcConnection, that = this;

    // 远端流附加了轨道
    rtcConnection.ontrack = function (event) {
        let stream = event.streams[0]
        console.log("get remote stream", stream);
        that.listeners['stream'] && that.listeners['stream'](stream);
    };

    /** 远端流过来了, 新建video标签显示 */
    rtcConnection.onaddstream = function (event) {

        console.log("get remote stream", event.stream);
        that.listeners['stream'] && that.listeners['stream'](event.stream);

    };

    rtcConnection.onremovestream = function (e) {

        console.log("on remove stream", arguments);
    }

    /** 设置本地sdp触发本地ice */
    rtcConnection.onicecandidate = function (event) {

        console.log('on remote ICE: ', event.candidate);
        if (event.candidate) {
            that.duoduo_signal.send('candidate', event.candidate);
        } else {
            console.log("onicecandidate end");
        }
    };

    rtcConnection.onnegotiationneeded = function (event) {
        console.log('onnegotiationneeded', event);
    };

    rtcConnection.oniceconnectionstatechange = function () {
        let state = rtcConnection.iceConnectionState
        console.log("ice connection state change to: ", state);
        if (state === 'connected') {
            console.log('rtc connect success')
        }
        if (that.dataChannel) {
            console.log('data channel state: ' + that.dataChannel.readyState);
        }
    };
}
// 真正开始连接
fn.start = function () {
    console.log('开始连接, 发出链接邀请');
    let rtcConnection = this.rtcConnection
    let that = this

    this.createOffer()

}
// 发起offer呼叫
fn.createOffer = function () {
    let that = this
    let rtcConnection = this.rtcConnection
    let config = {
        offerToReceiveAudio: 1,
        offerToReceiveVideo: 1
    };
    rtcConnection.createOffer(config).then(function (_offer) {
        console.log("create offer success", _offer);
        console.log("setLocalDescription")
        return rtcConnection.setLocalDescription(_offer).then(function () {
            console.log("after setLocalDescription, rtcConnection.localDescription:", rtcConnection.localDescription)
            that.duoduo_signal.send('offer', _offer);
        })
    }).catch((error) => {
        console.error("An error on startPeerConnection:", error)
    })
}

// 实时更新媒体流
fn.updateStream = function (stream) {
    if (!stream) stream = new MediaStream()
    if (stream.stream) stream = stream.stream


    var audioOld, videoOld, audio, video

    if (!this.stream) {
        this.stream = stream
        this.rtcConnection.addStream(stream)
        this.createOffer()
        return
    }

    // 先取所有轨道
    audioOld = this.stream.getAudioTracks()[0]
    videoOld = this.stream.getVideoTracks()[0]
    audio = stream.getAudioTracks()[0]
    video = stream.getVideoTracks()[0]

    // 新加轨道
    if (!audioOld) {
        audio && this.stream.addTrack(audio)
    }

    if (!videoOld) {
        video && this.stream.addTrack(video)
    }

    // 更新音频轨道
    if (audioOld) {
        // 移除轨道
        if (!audio) {
            this.stream.removeTrack(audioOld)
        } else {
            // 更新轨道
            if (audio !== audioOld) {
                this.stream.removeTrack(audioOld)
                this.stream.addTrack(audio)
            }
        }
    }

    // 更新视频轨道
    if (videoOld) {
        // 移除轨道
        if (!video) {
            this.stream.removeTrack(videoOld)
        } else {
            // 更新轨道
            if (video !== videoOld) {
                this.stream.removeTrack(videoOld)
                this.stream.addTrack(video)
            }
        }
    }

    let tmp = this.rtcConnection.getLocalStreams()
    tmp = tmp.length > 0 ? tmp[0] : null

    console.log(`当前rtc轨道数目`, tmp, (tmp && tmp.getTracks()))

    // if (this.stream) {
    //   console.log(`rtc 移除轨道数目: ${this.stream.getTracks().length}`, this.stream)
    //   this.rtcConnection.removeStream(this.stream)
    // }
    // this.stream = stream
    // console.log(`rtc 添加轨道数目: ${stream.getTracks().length}`, stream)
    // this.rtcConnection.addStream(stream)

    tmp = this.rtcConnection.getLocalStreams()
    tmp = tmp.length > 0 ? tmp[0] : null

    console.log(`更新后rtc轨道数目`, tmp, (tmp && tmp.getTracks()))

    this.createOffer()

}
// 实时更新data
fn.updateData = function (data) {
    if (!this.rtcConnection || !this.dataChannel) return
    this.dataChannel.send(data);
}
// dataChannel事件监听
fn.onDataChannel = function () {
    let that = this
    this.dataChannel.onopen = function () {
        console.log('dataChannel opened, ready now');
    };
    this.dataChannel.onerror = function (error) {
        console.error("dataChannel error:", error);
    };
    this.dataChannel.onmessage = function (data) {
        console.log(data);
        that.listeners['data'] && that.listeners['data'](data.data);
    };
}
/** 将对方加入自己的候选者中 */
fn.onNewPeer = function (candidate) {
    // var candidate = data.data;
    this.rtcConnection.addIceCandidate(new RTCIceCandidate(candidate));
}
/** 接收链接邀请，发出响应 */
fn.onOffer = function (offer) {
    let that = this;
    let rtcConnection = this.rtcConnection
    // var offer = data;
    console.log("on remote offer", offer);
    console.log('setRemoteDescription offer')
    rtcConnection.setRemoteDescription(offer).then(() => {
        return rtcConnection.createAnswer().then((_answer) => {
            console.log('create answer:', _answer)
            console.log('setLocalDescription answer')
            return rtcConnection.setLocalDescription(_answer).then(() => {
                console.log('send answer')
                that.duoduo_signal.send('answer', _answer);
            })
        })
    }).catch((error) => {
        console.log('onOffer error:', error)
    })
}
/** 接收响应，设置远程的peer session */
fn.onAnswer = function (answer) {
    let rtcConnection = this.rtcConnection
    // var answer = data;
    console.log('on remote answer', answer)
    console.log('setRemoteDescription answer')
    rtcConnection.setRemoteDescription(answer).catch(function (e) {
        console.error(e);
    });
}
