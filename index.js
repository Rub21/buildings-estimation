var fs = require('fs');
var osmium = require('osmium');
var turf = require('turf');
var argv = require('minimist')(process.argv.slice(2));
var _ = require('underscore');
var fc = turf.featurecollection([]);
var osmfile = argv.osmfile;
var file = new osmium.File(osmfile);
var location_handler = new osmium.LocationHandler();
var stream = new osmium.Stream(new osmium.Reader(file, location_handler));
stream.on('data', function(osm) {
	if (osm.type === 'way' && osm.tags().building !== undefined) {
		if (osm.geojson().type === 'LineString') {
			var points = turf.featurecollection([]);
			_.each(osm.geojson().coordinates, function(v, k) {
				var pt = turf.point(v);
				points.features.push(pt);
			});
			var centerPt = turf.center(points);
			fc.features.push(centerPt);
		}
	}
});

stream.on('end', function() {
	fs.writeFile('buildings-point.geojson', JSON.stringify(fc));
});