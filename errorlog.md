#### this document keeps all problems during my develop on this framework

+ `2016-1218` webrtc.js:138 Uncaught DOMException: Failed to execute 'send' on 'RTCDataChannel': RTCDataChannel.readyState is not 'open'(…)
> remove RtpDataChannels option when creating RTCPeerConnection

+ `2016-1218` no errors but no message received when i send ou a message
> you should not create the same channels on the sender and receiver side, but just use ondatachannel to get the channels created on the other side 

> just create createDataChannel before create offer!

+ `2016-1218` first user A can send message to second user B, but cant receive message from A??