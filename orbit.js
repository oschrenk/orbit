var http = require('http');
var express = require('express');
var mongoose = require('mongoose');

// TODO unit?
const DEFAULT_DISTANCE = 30;

/**************************************
 * Mongoose Schema Definition 
**************************************/

var Schema = mongoose.Schema;
var Item = new Schema();
Item.add({
	url			: { type: String, trim: true },
	title		: { type: String, trim: true },
	label		: { type: String, index: true, default: '', trim: true },
	timestamp	: { type: Date, default: Date.now },
	/* ! mongoDB demands that location is always {lon, lat} never {lat, lon}*/
	location: {
		lon : Number,
		lat : Number
	}
});
Item.index({
	location : "2d"
});
mongoose.connect('mongodb://127.0.0.1:27017/orbit', function (err) {
	if (err) {console.log("error in mongo connection"); throw err; }
	console.log("connected to mongo");
});

//save to collection "items"
var ItemModel = mongoose.model('items', Item);

/*************************************/
/* Express
/*************************************/

var app = module.exports = express.createServer();

// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});
	
// Routing
app.get('/', function(req, res){
	
	var label = req.route.path || '/';
	var lon = parseFloat(req.query["lon"]);
	var lat = parseFloat(req.query["lat"]);
	var maxDistance = isNaN(parseFloat(req.query["distance"])) ? DEFAULT_DISTANCE : parseFloat(req.query["distance"]);

	var items = [];
	ItemModel.find({label: label, location : { $near : [lon, lat], $maxDistance: maxDistance }} , function(err, items){
        if (err) { throw err };
		res.render('items', {
			title: 'Orbit',
			items: items,
			layout: 'layout'
		});
		res.end();
    });
	
});

app.listen(3000);