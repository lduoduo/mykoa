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

### QA:
#### 1. current only support 2 clients, otherwhiles will cause error `DOMException: Error processing ICE candidate`
#### 2. createAnwser cant be called before SetRemoteDescription `CreateAnswer can't be called before SetRemoteDescription.`

### logs
#### 1. add data channel, can send message now
#### 2. add different files for both dev/production enviroment.!
> dev: change the value to 'dev' in file config>env.js

> production: change the value to 'prd' in file config>env.js

### 服务启动后的访问链接

> https://ip:8081/koa/webrtc?roomid=10 `roomid值任意设置`


目前只支持2个client的p2p链接，即每个房间只支持2个人
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


## references
[google ppt](http://io13webrtc.appspot.com/#1)

[Real time communication with WebRTC](https://codelabs.developers.google.com/codelabs/webrtc-web/#3)

[通过WebRTC实现实时视频通信（一)](https://www.oschina.net/question/156697_172887)

[使用WebRTC搭建前端视频聊天室——入门篇](https://segmentfault.com/a/1190000000436544)

[Html5 点对点视频聊天 - 基于 HTML5、WebRTC、Node.js 的P2P视频聊天DEMO](https://www.linyuting.cn/gerenrizhi/webrtc-p2pusermedia.html)


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

