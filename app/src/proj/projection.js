/**
 * Our projection name space.
 * @type {Object}
 */
yarn.proj = {};

/**
 * Our projection factory.
 */
yarn.proj.Projection = function() {

	return {
		get: function(name) {
			var proj;

			if ('spherical mercator' === name) {
				proj = new yarn.proj.SphericalMercator();
			}

			return proj;
		}
	};

}();
