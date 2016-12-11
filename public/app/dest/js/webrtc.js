/** web rtc demo */

navigator.getUserMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia;
var constraints = {
    video: true,
    audio: true
};

if (navigator.getUserMedia) {
    // 支持
    var um = navigator.getUserMedia(constraints, success, err);
} else {
    console.log('web rtc not supported');
    // 不支持
}

function success(stream) {
    console.log(stream);
    // var video = document.createElement('video');
    var video = document.querySelector('#rtc');
    if (window.URL) {
        video.src = window.URL.createObjectURL(stream);
    } else {
        video.src = stream;
    }
    video.autoplay = true;
    //or
    // video.play();

    video.onloadedmetadata = function (e) {
        console.log("Label: " + stream.label);
        console.log("AudioTracks", stream.getAudioTracks());
        console.log("VideoTracks", stream.getVideoTracks());
    };

    document.body.appendChild(video);
}
function err(e) {
    console.log('err:' + e);
}