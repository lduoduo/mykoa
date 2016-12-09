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
``` javascript
    注意!
    分块加载的样式和脚本的加载顺序问题：
    1. 第一次同步给浏览器的内容里如果包含样式和脚本，浏览器会立即请求
    2. 后续的块状内容异步给浏览器后，对应的模块渲染完成，会立即请求模块里的样式文件
    3. 上面第二种情况对js不起作用，浏览器只会渲染，不会做请求!!why??
```
[@bigpipe demo地址](https://github.com/lduoduo/bigpipe_demo)

 stop update this file forever.