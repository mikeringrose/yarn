(function() {

	var DEG_TO_RAD = Math.PI / 180;

	function SphericalMercator() {

	}

	SphericalMercator.prototype = {

		project: function(latLng) {
			var latRad = latLng.lat * DEG_TO_RAD,
				x = latLng.lng * DEG_TO_RAD,
				y = (1.0 - (Math.log(Math.tan(latRad) + 1.0 / Math.cos(latRad)) / Math.PI));

			return new yarn.core.Point(x, y);
		},

		unproject: function(point) {

		}

	};

	yarn.core.SphericalMercator = SphericalMercator;
})();
