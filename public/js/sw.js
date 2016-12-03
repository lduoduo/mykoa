var port;

// self.addEventListener('push', function (event) {
//     var obj = event.data.json();

//     if (obj.action === 'subscribe' || obj.action === 'unsubscribe') {
//         fireNotification(obj, event);
//         port.postMessage(obj);
//     } else if (obj.action === 'init' || obj.action === 'chatMsg') {
//         port.postMessage(obj);
//     }
// });

// self.onmessage = function (e) {
//     console.log(e);
//     port = e.ports[0];
// }

// function fireNotification(obj, event) {
//     var title = 'Subscription change';
//     var body = obj.name + ' has ' + obj.action + 'd.';
//     var icon = 'push-icon.png';
//     var tag = 'push';

//     event.waitUntil(self.registration.showNotification(title, {
//         body: body,
//         icon: icon,
//         tag: tag
//     }));
// }





// var CACHE_NAME = 'lduoduo-cache-v1';

// // The files we want to cache
// var urlsToCache = [
//     '/',
//     '/styles/main.css',
//     '/script/main.js'
// ];
var push = {
    open() {
        var that = this;
        timer = setInterval(function () {
            that.notify();
        }, 3000);
    },
    close() {
        clearInterval(timer);
    },
    notify() {
        var id = "000" + Math.floor(Math.random() * 1000);
			id = id.slice(-5); id = id.replace('0', 'a');
        var notificationTitle = 'Hello';
        var notificationOptions = {
            body: '新消息来啦：编号' + id,
            icon: 'https://img02.tooopen.com/images/20150304/tooopen_sl_111592877249.jpg',
            badge: 'https://img.pconline.com.cn/images/upload/upc/tx/photoblog/1210/30/c3/14796375_14796375_1351589825281_thumb.jpg',
            tag: 'simple-push-demo-notification',
            data: {
                url: 'https://lduoduo.github.io/'
            }
        };
        self.registration.showNotification(notificationTitle, notificationOptions);
    }
}

// // Set the callback for the install step
self.addEventListener('install', function (event) {
    // Perform install steps
    console.log(event);
//     Notification.requestPermission();
    push.open();
    // event.waitUntil(
    //     caches.open(CACHE_NAME)
    //         .then(function (cache) {
    //             console.log('Opened cache');
    //             return cache.addAll(urlsToCache);
    //         })
    // );
});

self.addEventListener('push', function (event) {
    console.log('Received push');
    var notificationTitle = 'Hello';
    var notificationOptions = {
        body: '测试信息.',
        icon: 'https://img02.tooopen.com/images/20150304/tooopen_sl_111592877249.jpg',
        badge: 'https://img.pconline.com.cn/images/upload/upc/tx/photoblog/1210/30/c3/14796375_14796375_1351589825281_thumb.jpg',
        tag: 'simple-push-demo-notification',
        data: {
            url: 'https://lduoduo.github.io/'
        }
    };

    if (event.data) {
        var dataText = event.data.text();
        notificationTitle = 'Received Payload';
        notificationOptions.body = 'Push data: \'' + dataText + '\'';
    }

    event.waitUntil(Promise.all([self.registration.showNotification(notificationTitle, notificationOptions)]));
});


// var flag = false;
// var timer = null;