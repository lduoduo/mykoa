#### this document keeps all problems during my develop on this framework

+ `2016-1203` why 404 not work when request wrong page? 
 > ##### only when put service['404'] into compose together with others can work...why?

+ `2016-1204` TypeError: Invalid non-string/buffer chunk at Object.module.exports.Readable.render 
 > ##### should use yield...

+ `2016-1204` why yield function use co-view will make me down something in the browser when i request the page?  
 > ##### you should set the type of response to 'html', default value was `application/octet-stream`...

+ `2016-1211` it doesn't work on mobile device when post jsonp, error is only '{}'

+ `2016-1211` can't get 'this.request.body' when post something