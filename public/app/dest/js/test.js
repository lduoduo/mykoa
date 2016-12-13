var mongoose	= require('mongoose');
var Schema		= mongoose.Schema;

mongoose.connect('mongodb://localhost/photolib'); // connect to our database

var PhotoSchema = new Schema({
	title:String,
	description:String,
	type:String,
	size:Number,
	sizeType:String,
	device:String,	
	dimensions:String,
	exposureTime:String,
	isActive:Boolean,
	imgPath:String,
	startCount:Number,
	createDate:Date,
	createUserId:String,
	lastmodifyDate:Date
},{collection:"photos"});

module.exports = mongoose.model('Photo', PhotoSchema);




var Photo = require('./photo');

var photoSvc = {};

photoSvc.getMostPopularBG = function(cb){
	Photo.find().select({_id:1, title: 1, description:1, imgPath:1,starCount:1}).exec(function(err, photos){
		if (err) throw err;
		//console.log("photos:"+toString(photos));
		cb(photos);
	});
}

// photoSvc.getMostPopularBG = function(cb){
//   Photo.findOne({_id:'56532c94c19f220c5742d999'}, function(err, data){
//     if (err) throw err;
//     console.log("photos:"+toString(data));
//     cb(data);
//   });
// }


  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = photoSvc;
    }
    exports.photoSvc = photoSvc;
  }

  //module.exports & exports.XXX - > make this be public to other file




  var Photo = require('./photo');

  Photo.findOne({}, function(err, data){
    if (err) throw err;
    console.log(data);
  });


  