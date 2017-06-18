console.log('you find me');

function showLocal(){
    var video = document.createElement('video')
    video.srcObject = localVideo
    video.play()
}