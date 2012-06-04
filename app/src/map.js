yarn.Map = (function() {

    /**
     * Our core map options.
     * @param {Object} options TODO: MR add all of the options.
     *                         el: {String, Element} 
     *                         center: {yarn.LatLng}
     *                         zoom: {Number} 
     */
    function Map(options) {
        var width = options.el.clientWidth,
            height = options.el.clientHeight,
            projection = y.proj.Projection.get(options.projection || 'spherical mercator');

        this.model = new yarn.models.Map({
            tileSize: options.tileSize,
            zoom: options.zoom,
            center: options.center,
            projection: projection,
            dimensions: { width: width, height: height },
            width: width,
            height: height
        });

        this.view = new yarn.views.Map({
            el: options.el,
            model: this.model
        });

        this.view.render();
    }

    Map.prototype = {

        /**
         * Zoom's in by 1.
         * @return {Object} *this* 
         */
        zoomIn: function() {
            var zoom = this.model.get('zoom');
            return this.setZoom(zoom + 1);
        },

        /**
         * Zoom's out by 1
         * @return {Object} *this*
         */
        zoomOut: function() {
            var zoom = this.model.get('zoom');
            return this.setZoom(zoom - 1);
        },

        /**
         * Sets the zoom level.
         * @param {Number} zoom
         * @return {Object} *this*
         */
        setZoom: function(zoom) {
            var minZoom = this.model.get('minZoom'),
                maxZoom = this.model.get('maxZoom');

            this.model.set({'zoom': zoom < minZoom ? minZoom : zoom > maxZoom ? maxZoom : zoom});

            return this;
        },

        /**
         * Pan's tye map to the supplied lattitude/longitude.
         * @param  {yarn.LatLng} latlng     new map
         * @return {Object}                 *this*
         */
        setCenter: function(latlng) {
            this.model.set({'center':latlng});
            return this;
        }

    };

    return Map;

}());