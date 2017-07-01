/**
 * rtcdata备份
 */
// 音视频画面容器
let $localVideo = document.querySelector('.J-local-video');
let $remoteVideo = document.querySelector('.J-remote-video');

var home = {
    // 显示远程的列表
    remoteVideo: {},
    init() {
        this.initEvent();
    },
    initEvent() {
        $('body').on('click', '.J-start', this.startRTC.bind(this))
        $('body').on('click', '.J-startMedia', this.controlMedia.bind(this))
        $('body').on('click', '.J-send', this.sendData.bind(this))

        window.addEventListener('beforeunload', this.destroy.bind(this));
    },
    destroy() {
        if (!this.rtc) return
        this.rtc.stop()
    },
    controlMedia(e) {
        if (!this.localStream) {
            this.initDevice()
            $(e.target).text('关闭音视频')
            return
        }
        this.stopDevice()
        $(e.target).text('开启音视频')
    },
    // 关闭音视频
    stopDevice() {
        let stream = this.localStream
        stream.getTracks().forEach(track => {
            track.stop()
            stream.removeTrack(track)
        })
        this.localStream = stream = null

        if (this.rtc && this.rtc.inited) {
            this.rtc.updateStream()
        }
    },
    /**
    * 开启音视频
    */
    initDevice() {
        this.getDevices().then(function (devices) {
            devices = devices.video;
            this.startLocalStream(devices[0].deviceId);
        }.bind(this));
    },
    /**
     * 获取设备列表
     * 
     * @returns obj 设备列表对象
     */
    getDevices() {
        return new Promise(function (resolve, reject) {
            // 文档见: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/enumerateDevices
            if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
                // console.log("your browser not support this feature");
                return reject(new Error("your browser not support this feature, see https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/enumerateDevices"));
            }
            navigator.mediaDevices.enumerateDevices().then(function (devices) {
                let result = {
                    video: [],
                    audio: []
                };
                devices.forEach(function (device, index) {
                    if (device.kind === "videoinput") {
                        result.video.push({
                            deviceId: device.deviceId,
                            label: device.label ? device.label : "camera " + (result.video.length + 1)
                        });
                    } else if (device.kind === "audioinput") {
                        result.audio.push({
                            deviceId: device.deviceId,
                            label: device.label
                        });
                    }
                });
                return resolve(result);
            }).catch(function (e) {
                return reject(e);
            });
        });
    },
    /**
     * 获取本地音视频流
     * 
     * @param {any} deviceId 
     * @returns promise
     */
    getLocalStream(deviceId) {
        let videoSetting = ['1280', '720', '20'];
        return new Promise(function (resolve, reject) {
            navigator.mediaDevices.getUserMedia({
                video: {
                    deviceId: deviceId,
                    width: videoSetting[0],
                    height: videoSetting[1],
                    frameRate: videoSetting[2]
                },
                audio: true
            }).then(function (stream) {
                resolve(stream);
            }).catch(reject);
        });
    },
    startLocalStream(deviceId) {
        let that = this;
        this.getLocalStream(deviceId).then((stream) => {
            that.localStream = stream;
            // $localVideo.volume = 0;
            $localVideo.autoplay = true;
            $localVideo.srcObject = stream;

            if (that.rtc && that.rtc.inited) {
                that.rtc.updateStream(stream)
            }
        }).catch((e) => {
            // mylog("<font>can't get local camera, see console error info</font>", '', 'error');
            console && console.error && console.error(e);

        });
    },
    sendData(e) {
        if (!this.rtc || !this.rtc.inited) return
        let data = $('.J-rtc-data').val()
        if (!data) return
        this.rtc.updateData(data)
    },
    /** 
     * 开启rtc连接
     * 支持的事件注册列表
     * mediastream
     * stop
     */
    startRTC() {
        if (this.rtc && this.rtc.inited) return

        let cname = $('.rtc__channelName').val()

        if (!cname) {
            Mt.alert({
                title: '请先输入房间号',
                confirmBtnMsg: '好'
            });
            return
        }

        let stream = this.localStream

        let host = 'ldodo.cc'
        // let host = window.location.hostname + ':8099'

        let url = `wss://${host}/rtcWs/?roomId=${cname}`;

        let rtc = this.rtc = new rtcPeer();
        rtc.init({ url, stream }).then(obj => {
            console.log('支持的注册事件:', obj)
        })

        rtc.on('stream', this.startRemoteStream.bind(this))
        rtc.on('data', this.startRemoteData.bind(this))
        rtc.on('stop', this.stopRTC.bind(this))
        rtc.on('ready', function (obj) {
            console.log(obj)
            let {status, error, url} = obj

            Mt.alert({
                title: status ? 'webrtc连接成功' : error,
                msg: url || '',
                confirmBtnMsg: '好哒',
                timer: 1000
            });
        })
    },
    // 接收到远程流，进行外显
    startRemoteStream(stream) {
        console.log('remote stream:', stream);
        $remoteVideo.srcObject = stream;
        $remoteVideo.play();
    },
    // 接收远程数据
    startRemoteData(data) {
        console.log('remote data:', data);
    },
    // 远程连接断开
    stopRTC(uid) {
        console.log(`远程rtc连接已断开,用户: `, uid)
    }
}


home.init();

/**
 * 测试步骤
 * 1. 打开页面，自动获取到本地媒体流并显示
 * 2. 手动跑这个方法，传入一个自定义的频道名字，必传!!!
 */
function start(cname) {
    home.startRTC(cname)
}


