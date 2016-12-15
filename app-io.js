var https = require('https');
var koa = require('koa');
var app = koa();
var socket = require('socket.io');

var fs = require('fs');
var config = require('./config');

//https option
var options = {
    key: fs.readFileSync('keys/server.key'),
    cert: fs.readFileSync('keys/server.crt'),
};
//https
var server = https.createServer(options, app.callback());
var io = socket(server);


var room = {};

io.on('connection', function (sockets) {
    var roomId = "my";
    var user = {};
    var tmp = room[roomId] = {};
    sockets.on('join', function (userinfo) {
        // if(userinfo && userinfo.id && userinfo.name){
        //     user = userinfo;
        //     tmp[user.id] = user;
        //     return;
        // }
        var id = "000" + Math.floor(Math.random() * 1000);
        id = id.slice(-5); id = id.replace('0', 'a');
        user.id = id;
        user.name = (userinfo && userinfo.name) || user.id;
        tmp[user.id] = user;

        //给自己发消息
        sockets.emit('self', 'self', user);
        // 广播向其他用户发消息
        sockets.broadcast.emit('sys', 'in', user);
        console.log(user.id + '加入了' + roomId);

        sockets.join(roomId);
    });
    sockets.on('disconnect', function () {
        // 从房间名单中移除
        if (user && tmp[user.id]) {
            delete tmp[user.id];
            io.to(roomId).emit('sys', 'out', user);
            console.log(user.id + '退出了' + roomId);
            console.log(room);
        }

        sockets.leave(roomId);    // 退出房间

    });

    sockets.on('candidate',function(data){
        console.log(data);
        sockets.broadcast.emit('candidate', data);
    });


    // 接收用户消息,发送相应的房间
    sockets.on('message', function (users, msg) {
        // 验证如果用户不在房间内则不给发送
        if (!users || !users.id || !tmp[users.id]) {
            return false;
        }
        // 广播向其他用户发消息
        sockets.broadcast.emit('msg', users, msg);
        sockets.emit('msg', users, msg);
        //向房间发消息
        // io.to(roomID).emit('msg', users, msg);
    });
});

module.exports = function () {
    server.listen(config.socketPorts, function () {
        console.log('socket server https on ' + config.socketPorts);
    });
}

