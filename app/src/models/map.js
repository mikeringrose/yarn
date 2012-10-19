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
             * Current zoom level.
             * @type {Number}
             */
            zoom: null,

            /**
             * Max zoom level.
             * @type {Number}
             */
            minZoom: 1,

            /**
             * Minimum zoom level.
             * @type {Number}
             */
            maxZoom: 18,

            /**
             * Our current center lat/lng pair.
             * @type {yarn.LatLng}
             */
            center: null,

            /**
             * The current view port.
             * @type {yarn.models.Viewport}
             */
            viewport: null

        },

        /**
         * Backbone initialization function
         * @param  {Object} options configuration object
         * @return {void}         
         */
        initialize: function(options) {
            var self = this;

            self.set({ 'viewport': self.calculateViewport(self, self.get('zoom') ) } );

            //- when our zoom is updated, make sure to update the viewport
            self.on('change:zoom', function(model, zoom) {
                self.set({ 'viewport': this.calculateViewport(model, zoom) });
            });

            self.on('change:center', function(model, center) {
                this.updateViewport(model, center);
            });
        },

        zoomIn: function() {
            var zoom = this.get('zoom'),
                maxZoom = this.get('maxZoom');

            zoom += 1;

            if (zoom < maxZoom) {
                this.set({'zoom': zoom});
            }
        },

        /**
         * Updates the current viewport with the new bounds.
         * @param  {Backbone.Model} model   map model
         * @param  {yarn.LatLng}    center  new center latlng for the map
         * @return {void}                   
         */
        updateViewport: function(model, center) {
            var viewport = this.get('viewport'),
                projectedCenter = this.project(center),
                halfedCenter = this.getHalfDimensionsMercator(); 

            viewport.set({
                topLeft: new yarn.Point(projectedCenter.x - halfedCenter.x, projectedCenter.y + halfedCenter.y),
                bottomRight: new yarn.Point(projectedCenter.x + halfedCenter.x, projectedCenter.y - halfedCenter.y)
            });   
        },

        /**
         * Calculates a new viewport based on a zoom level change.
         * @param  {yarn.Models.Map}            model *this*
         * @param  {Number} zoom                the new zoom level
         * @return {yarn.models.Viewport}       new viewport
         */
        calculateViewport: function(model, zoom) {
            var center = model.get('center'),
                resolution = this.getResolution(model),
                projectedCenter = this.project(center),
                halfedCenter = this.getHalfDimensionsMercator(); 
                
            return new yarn.models.Viewport({
                topLeft: new yarn.Point(projectedCenter.x - halfedCenter.x, projectedCenter.y + halfedCenter.y),
                bottomRight: new yarn.Point(projectedCenter.x + halfedCenter.x, projectedCenter.y - halfedCenter.y),

                //- need i say, this is junk, a whole lot of junk
                transform: function(point) {
                    var px = ( point.x + 20037508.34 ) / resolution,
                        py = ( -point.y + 20037508.34 ) / resolution;

                    return new yarn.Point(px, py);
                }
            });
        },

        moveByPixels: function(offset) {
            var center = this.get('center'),
                offsetProjected = this.reverse(offset),
                centerProjected = this.project(center).subtract(offsetProjected);

            this.set({ 'center': this.unproject(centerProjected) });
        },

        getProjection: function() {
            return this.get('projection');
        },

        /**
         * Returns the resolution for the state of the current model.
         * @param  {Backbone.Model} model   *this*
         * @return {Number}                 map resolution for the current map state
         */
        getResolution: function(model) {
            var zoom = model.get('zoom'),
                tileSize = model.get('tileSize'),
                projection = model.get('projection');

            return projection.getResolution(zoom, tileSize);
        },

        /**
         * Returns the dimensions of this map halfed and scaled to projected values.
         * @return {yarn.Point} 
         */
        getHalfDimensionsMercator: function() {
            var projection = this.get('projection'),
                transformer = projection.getTransformer(this.get('zoom'), this.get('tileSize')),
                point = new yarn.Point(this.get('width'), this.get('height')).divide(2);

            return transformer.reverse(point);
        },

        /**
         * Returns the projected center for this model.
         * @param  {Backbone.Model} model   a map model
         * @param  {yarn.LatLng}    center  center latlng
         * @return {yarn.Point}             projected point in mercator miles
         */
        project: function(latLng) {
            var projection = this.get('projection');
            return projection.project(latLng);
        },

        unproject: function(point) {
            var projection = this.get('projection');
            return projection.unproject(point);
        },

        transformLatLngToPixels: function(latLng) {
            var projection = this.getProjection(),
                transformer = projection.getTransformer(this.get('zoom'), this.get('tileSize')),
                projected = projection.project(latLng);

            return transformer.forward(projected);
        },

        /**
         * Reverses a pixels into projected space.
         * @param  {yarn.Point}     point   to reverse
         * @return {yarn.Point}             point in projected space
         */
        reverse: function(point) {
            var projection = this.get('projection'),
                transformer = projection.getTransformer(this.get('zoom'), this.get('tileSize'));
            return transformer.reverse(point);
        }

    });

}());