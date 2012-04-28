# Orbit #

Orbit is a tool to store and share URI based on your current location

## Development ##

	brew install mongodb
	git clone git://github.com/oschrenk/orbit-backend.git
	npm install

Dependencies

- [mongoose](https://github.com/LearnBoost/mongoose)
- [express](https://github.com/visionmedia/express)
- [jade](http://jade-lang.com/)

## Database ##

- [MongoDB](http://www.mongodb.org/)

### Layout ###

The database layout is very simple. (For now) we only need one collection. Examplary `save()`

	db.orbit.save(
		{ 
			url: "abc.de",
			label: "/",
			location : { lon : 40.739037, lat: 73.992964 },
			expires: "2012-04-27T23:59Z"
		}
	);

- `url` the url we want to share
- `title` title of the homepage
- `label` for categorizing and searching/sorting
- `location` where do we share the bookmark
- `expires` [ISO 8601](http://en.wikipedia.org/wiki/ISO_8601) encoded timestamp when the entry is purged from database

### Indices ###

Speedup searching for a `label`

	db.orbit.ensureIndex({ label : 1 })

MongoDB supports spatial Indexing

**Caveats** 

1. MongoDB 1.8+ supports spherical geometries. 
2. MongoDB assumes that you are using decimal degrees in (longitude, latitude) order. This is the same order used for the [GeoJSON](http://geojson.org/geojson-spec.html#positions) spec.
3. All distances use [radians](http://en.wikipedia.org/wiki/Radians).
4.MongoDB doesn't handle wrapping at the poles or at the transition from -180° to +180° longitude but raises an error.
5.Earth-like bounds are `[-180, 180)`, valid values for latitude are between `-90° and 90°`.

Creating the spatial index

	db.orbit.ensureIndex({ location : "2d" })
	var earthRadius = 6378 // km
	var range = 3000 // km

Searching for an item near a location

	distances = db.runCommand({ geoNear : "points", near : [0, 0], spherical : true, maxDistance : range / earthRadius /* to radians */ }).results
	
### Scaffolding ###

Start mongodb daemon

	$ mongod run --config /usr/local/Cellar/mongodb/2.0.4-x86_64/mongod.conf

Start mongoDB shell and store an exampe item

	$ mongo

	> db.items.save(
		{ 
			url: "http://acme.inc",
			title: "Acme - We make everything!"
			label: "/",
			location : { lon : 23, lat: 56 },
			expires: "2012-04-27T23:59Z"
		}
	);
	
### Queries ###

Search for *label only*

	ItemModel.find( {label: 'global'} , function(err, docs){ /* code */ });
	
Search for a *location*	
	
	ItemModel.find({location : { $near : [23, 56], $maxDistance: 30 }} , function(err, docs){ /* code */ });
	
Seach for a *label and location*	
	
	ItemModel.find({label: 'global', location : { $near : [23, 56], $maxDistance: 30 }} , function(err, docs){ /* code */ });