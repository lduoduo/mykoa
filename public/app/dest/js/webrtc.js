/** web rtc demo */

navigator.getUserMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia;

var PeerConnection = (window.PeerConnection ||
    window.webkitPeerConnection00 ||
    window.webkitRTCPeerConnection ||
    window.mozRTCPeerConnection);

window.AudioContext = window.AudioContext || webkitAudioContext;
var actx = new AudioContext();

var canvas = document.createElement('canvas');
canvas.width = 320; canvas.height = 240;
var cctx = canvas.getContext('2d');

var video = document.querySelector('#rtc');

var constraints = {
    video: {

        mandatory: {
            maxWidth: 320,
            maxHeight: 240
        }
    },
    audio: false
};

var rtc = {
    init() {
        this.initStatus();
        this.initEvent();
    },
    initEvent() {
        var _this = this;
        var shots = $('#snapshot');
        shots.addEventListener('click', (e) => {
            console.log(e);
            if (_this.stream) {
                cctx.drawImage(video, 0, 0);
                $('#img').src = canvas.toDataURL('image/webp');
            }
        });
    },
    //init local camara
    initStatus() {
        var _this = this;
        if (navigator.getUserMedia) {
            // 支持
            navigator.getUserMedia(constraints, function(stream) {
                _this.loadStream(_this, stream);
            }, _this.err);
            _this.mstlist();
        } else {
            console.log('web rtc not supported');
            // 不支持
        }
    },
    //init connection
    initPeerConnection() {
        var servers = null;
        // Add pc1 to global scope so it's accessible from the browser console
        window.pc1 = pc1 = new RTCPeerConnection(servers);

        pc1.onicecandidate = function(e) {
            onIceCandidate(pc1, e);
        };

        // Add pc2 to global scope so it's accessible from the browser console
        window.pc2 = pc2 = new RTCPeerConnection(servers);

        pc2.onicecandidate = function(e) {
            onIceCandidate(pc2, e);
        };

    },
    loadStream(ctx, stream) {
        console.log(stream);
        ctx.stream = stream;
        // var video = document.createElement('video');


        if (window.URL) {
            video.src = window.URL.createObjectURL(stream);
        } else {
            video.src = stream;
        }
        // video.autoplay = true;
        //or
        video.play();

        video.onloadedmetadata = function(e) {
            console.log("Label: " + stream.label);
            console.log("AudioTracks", stream.getAudioTracks());
            console.log("VideoTracks", stream.getVideoTracks());
        };

        // var audioInput = actx.createMediaStreamSource(stream);
        // audioInput.connect(actx.destination);

    },
    err(e) {
        console.log(e);
    },
    //获取摄像头和麦克风的列表
    mstlist() {
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

function $(name) {
    return document.querySelector(name);
}

function onIceCandidate(pc, event) {
    if (event.candidate) {
        getOtherPc(pc).addIceCandidate(
            new RTCIceCandidate(event.candidate)
        ).then(
            function() {
                onAddIceCandidateSuccess(pc);
            },
            function(err) {
                onAddIceCandidateError(pc, err);
            }
            );
        trace(getName(pc) + ' ICE candidate: \n' + event.candidate.candidate);
    }
}