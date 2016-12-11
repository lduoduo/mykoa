# mykoa
my koa frameworks for my own projects, trying to make a fully adapted productive frameworks

now begin...

make it little by little, branch by branch, master branch always be the latest one with all features.
if you want to learn from start.

follow the orders below.

### branches info

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


### how to create a self-signed certificate
`step 1` download openssl client
 [win click here](http://slproweb.com/products/Win32OpenSSL.html)
 > for OSX no need to download, just run commands in your terminal

`step 2` run commands to generate the certificate
+ Generate a Private Key
 > openssl genrsa -des3 -out server.key 1024

+ Generate a CSR (Certificate Signing Request)
 > openssl req -new -key server.key -out server.csr

+ Remove Passphrase from Key
 > cp server.key server.key.org
 > openssl rsa -in server.key.org -out server.key

+ Generating a Self-Signed Certificate
 > openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.crt

`step 3` import certificate into nodejs
``` javascript
    var https = require('https');
    var koa = require('koa');
    var app = koa();

    //https option
    var options = {
        key: fs.readFileSync('keys/server.key'),
        cert: fs.readFileSync('keys/server.crt'),
    };

    //https
    https.createServer(options, app.callback()).listen(config.staticPorts, function () {
        console.log('static https on ' + config.staticPorts);
    });

```
`step 4` start your server and test

 ### references
 + [http://www.akadia.com/services/ssh_test_certificate.html](http://www.akadia.com/services/ssh_test_certificate.html)
