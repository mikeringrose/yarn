(function() {
	
	/**
	 * Our core view that represents the "slippy map". 
	 * @type {Backbone.View}
	 */
	yarn.views.Map = Backbone.View.extend({

		/**
		 * Our delegated events
		 * @type {Object}
		 */
		events: {
			'mousedown': 'dragStart',
			'mousemove': 'drag',
			'mouseup' : 'dragEnd'
		},

		/**
		 * Initializer for the map.
		 * @param  {Object} options Required is the el element.
		 * @return {void}         
		 */
		initialize: function(options) {
			this.layer = new yarn.views.TileLayer({ 
				model: this.model
			});
		},

		/**
		 * Renders the map and loads our tiles.
		 * @return {yarn.view.Map} this instance of the map
		 */
		render: function() {
			this.el.appendChild(this.layer.render().el);
		},

		dragStart: function(event) {
			this.dragPoint = new yarn.Point(event.clientX, event.clientY);
		},

		dragEnd: function(event) {
			this.dragPoint = null;
		},

		drag: function(event) {
			if (!this.dragPoint) return;

			var prevPoint = this.dragPoint,
				currPoint = new yarn.Point(event.clientX, event.clientY),
				difference = currPoint.subtract(prevPoint),
				pos = this.$el.offset();

			this.dragPoint = currPoint;
		}

	});

})();