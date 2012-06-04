yarn.models.Viewport = Backbone.Model.extend({
	
	defaults: {

		/**
		 * Projected top of the viewport
		 * @type {Number}
		 */
		top: 0,

		/**
		 * Projected left side of the viewport
		 * @type {Number}
		 */
		left: 0,

		/**
		 * Projected right side of the viewport
		 * @type {Number}
		 */
		right: 0,

		/**
		 * Projected bottom of the viewport
		 * @type {Number}
		 */
		bottom: 0,

		/**
		 * Trasformer for this viewport, from projected to pixel.
		 * @type {[type]}
		 */
		transformer: null

	},

	/**
	 * Returns the pixel coordinates of the top left.
	 * @return {yarn.Point} top left pixel coordinates
	 */
	getTopLeft: function() {
		var transform = this.get('transform');
		return transform(new yarn.Point(this.get('left'), this.get('top')));
	},

	/**
	 * Returns the pixel coordinates of the bottom right.
	 * @return {yarn.Point} bottom right pixel coordinates
	 */
	getBottomRight: function() {
		var transform = this.get('transform');
		return transform(new yarn.Point(this.get('right'), this.get('bottom')));
	}

});