/**
 * map.js
 * Houses the map model which is at the core.
 */
(function() {
	
	/**
	 * The core model object that represents a map and all of its attributes.
	 * @type {Backbone.Model}
	 */
	yarn.models.Map = Backbone.Model.extend({

		/**
		 * Our model defaults
		 * @type {Object}
		 */
		defaults: {

			/**
			 * Defulat to the standard tile size of 256 pixels.
			 * @type {Number}
			 */
			tileSize: 256,

			/**
			 * Default our projection to spherical mercator.
			 * @type {String}
			 */
			projection: 'spherical mercator',

			/**
			 * Max zoom level.
			 * @type {Number}
			 */
			minZoom: 1,

			/**
			 * Minimum zoom level.
			 * @type {Number}
			 */
			maxZoom: 18

		}

	});

})();