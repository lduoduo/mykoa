## web RTC `web real time communication`
> no need any plugs to support real time communication of video/audio/text/file transfer and so on.
> directly p2p connection through browser to browser, no need transfer message from server.

### 1. three base APIS
+ navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia
 > currently get local user video or audio media as stream

+ RTCPeerConnection || webkitRTCPeerConnection || mozRTCPeerConnection
 > init peer to peer connection, this need connect to server first to build connection 

+ RTCDataChannel || webkitRTCPeerConnection
 > transfer data between browsers

### 2. getUserMedia and display as video
### 3. how to make a connection between browsers?
### 4. how to join and leave the coversation
### 5. take screen shot and send


## references
[google ppt](http://io13webrtc.appspot.com/#1)

[Real time communication with WebRTC](https://codelabs.developers.google.com/codelabs/webrtc-web/#3)

[通过WebRTC实现实时视频通信（一)](https://www.oschina.net/question/156697_172887)

[使用WebRTC搭建前端视频聊天室——入门篇](https://segmentfault.com/a/1190000000436544)

## all branches info

+ `master` [back to master](https://github.com/lduoduo/mykoa)
 > ##### always be the latest branch merged with all other branches.

+ `original` [20161125](https://github.com/lduoduo/mykoa/tree/original)
[20161125]: https://github.com/lduoduo/mykoa/tree/original
 > ##### original one, this branch include basic function.
 
+ `bigpipe` [20161204](https://github.com/lduoduo/mykoa/tree/bigpipe)
 > ##### this branch include basic bigpipe function.

+ `bigpipe-request` [20161206](https://github.com/lduoduo/mykoa/tree/bigpipe-request)
 > ##### this branch render template with http request use bigpipe.

+ `static-files` [20161207](https://github.com/lduoduo/mykoa/tree/static-files)
 > ##### this branch manage request of static files such as js/css/png/jpg files.

+ `webRTC` [20161211](https://github.com/lduoduo/mykoa/tree/webRTC)
 > ##### demos learning web real time communication

+ `https` [20161211](https://github.com/lduoduo/mykoa/tree/https)
 > ##### enable https connection use self signed certificate

+ `monitor` [20161211](https://github.com/lduoduo/mykoa/tree/monitor)
 > ##### front-end error/performance monitor data collector

