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

            });
        },

        updateViewport: function(model, center) {

        },

        /**
         * Calculates a new viewport based on a zoom level change.
         * @param  {yarn.Models.Map}            model *this*
         * @param  {Number} zoom                the new zoom level
         * @return {yarn.models.Viewport}       new viewport
         */
        calculateViewport: function(model, zoom) {
            var center = model.get('center'),
                proj = model.get('projection'),
                tileSize = model.get('tileSize'), 
                projCenter = proj.project(center),
                resolution = proj.getResolution(zoom, tileSize),
                centerX = model.get('width') / 2 * resolution,               
                centerY = model.get('height') / 2 * resolution;

            return new yarn.models.Viewport({
                top: projCenter.y + centerY,
                left: projCenter.x - centerX,
                right: projCenter.x + centerX,
                bottom: projCenter.y - centerY,
                //- need i say, this is junk, a whole lot of junk
                transform: function(point) {
                    px = ( point.x + 20037508.34 ) / resolution,
                    py = ( -point.y + 20037508.34 ) / resolution;

                    return new yarn.Point(px, py);
                }
            });
        }

    });

})();