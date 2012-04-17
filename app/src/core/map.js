(function() {

	/**
	 * Our core map options.
	 * @param {Object} options TODO: MR add all of the options.
	 *                         el: {String, Element} 
	 *                         center: {yarn.core.LatLng}
	 *                         zoom: {Number} 
	 */
	function Map(options) {
		var proj = options.proj || new yarn.core.SphericalMercator(),
			width = options.el.clientWidth,
			height = options.el.clientHeight;

		this.model = new yarn.models.Map({
			tileSize: options.tileSize,
			zoom: options.zoom,
			center: options.center,
			dimensions: { width: width, height: height }
		});

		this.view = new yarn.views.Map({
			el: options.el,
			model: this.model,
			proj: proj 
		});

		this.view.render();
	}

	Map.prototype = {

	};

	yarn.core.Map = Map;

})();