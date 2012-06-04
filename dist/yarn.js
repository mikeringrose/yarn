/*! PROJECT_NAME - v0.1.0 - 2012-06-04
* http://PROJECT_WEBSITE/
* Copyright (c) 2012 Mike Ringrose; Licensed MIT */

var y = yarn = {};
yarn.LatLng = function() {
	
	function LatLng(lat, lng) {
		this.lat = lat;
		this.lng = lng;
	}

	return LatLng;

}();

/**
 * Simple point object.
 */
yarn.Point = function() {
	
	function Point(x, y) {
		this.x = x;
		this.y = y;
	}

	Point.prototype = {

		/**
		 * Non-destructive subtract operation that returns a new point.
		 * @param  {yarn.Point} 	other 	point to subtract
		 * @return {yarn.Point}       		the resulting point
		 */
		subtract: function(other) {
			return new Point(this.x - other.x, this.y - other.y);
		}

	};

	return Point;

}();
yarn.Map = function() {

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

}();
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

/**
 * PROJCS["unnamed",
 *  GEOGCS["unnamed ellipse",
 *      DATUM["unknown",
 *          SPHEROID["unnamed",6378137,0]],
 *      PRIMEM["Greenwich",0],
 *      UNIT["degree",0.0174532925199433]],
 *  PROJECTION["Mercator_2SP"],
 *  PARAMETER["standard_parallel_1",0],
 *  PARAMETER["central_meridian",0],
 *  PARAMETER["false_easting",0],
 *  PARAMETER["false_northing",0],
 *  UNIT["Meter",1],
 *  EXTENSION["PROJ4","+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs"]]
 */
yarn.proj.SphericalMercator = function() {

        /**
         * Contant for converting degrees to radians.
         * @type {Number}
         */
    var DEG_TO_RAD          = Math.PI / 180,

        /**
         * Constant for converting radians to degrees.
         * @type {Number}
         */
        RAD_TO_DEG          = 180 / Math.PI,

        /**
         * Radius of the spheroid.
         * @type {Number}
         */
        EARTH_RADIUS_METERS = 6378137,

        /**
         * The extents of the projection in both the X and Y direction, mercator is a square, hence, they are the same. Defined as 
         * Math.PI * EARTH_RADIUS_METERS or Math.log( ( Math.tan(85.05112878 * Math.PI/180) ) + 1 / Math.cos(85.05112878 * Math.PI/180) ) * EARTH_RADIUS_METERS)
         * @type {Number}
         */
        EXTENTS             = { x: 20037508.34, y: 20037508.34 };

    /**
     * Empty constructor.
     */
    function SphericalMercator() {}

    SphericalMercator.prototype = {     

        /**
         * Returns the resolution given the supplied zoom and tile size.
         * @type {[type]}
         */
        getResolution: _.memoize(
            function(zoom, tileSize) {
                return ( 2 * EXTENTS.x / (Math.pow(2, zoom) * tileSize) );
            }
        ),

        /**
         * Given a lat/lng pair project it. The x and y values returned are equivalent to x/R and y/R, where R is the radius of the sphere of the Earth.
         * @param  {yarn.LatLng}    latLng  to project
         * @return {yarn.Point}         the projected point
         */
        project: function(latLng) {
            var metersPer = EXTENTS.x / Math.PI,
                latRad = latLng.lat * DEG_TO_RAD,
                x = latLng.lng * DEG_TO_RAD * metersPer,
                y = Math.log( ( Math.tan(latRad) ) + 1 / Math.cos(latRad) ) * metersPer;

            return new yarn.Point(x, y);
        },

        /**
         * Given a projected point, convert it to lat/lng space.
         * @param  {yarn.Point}     point   to unproject
         * @return {yarn.LatLng}        the point in lat/lng space
         */
        unproject: function(point) {
            var metersPer = EXTENTS.y / Math.PI,
                lat = RAD_TO_DEG * (2.0 * Math.atan(Math.exp( point.y / metersPer ) ) - Math.PI / 2.0),
                lng = point.x / metersPer * RAD_TO_DEG;

            return new yarn.LatLng(lat, lng);
        }

    };

    return SphericalMercator;
}();

yarn.models = {};
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
yarn.views = {};
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
(function() {

    /**
     * The tile layer. This class needs much work. Most math was taken from http://en.wikipedia.org/wiki/Mercator_projection and from the OSM wiki. I implemented 
     * much of this myself, should look at other toolkit for optimizations.
     * @type {Backbone.View}
     */
    yarn.views.TileLayer = Backbone.View.extend({

        /**
         * Our backbone initializer.
         * @param  {Object} options
         * @return {void}         
         */
        initialize: function(options) {
            var self = this;
            self.tiles = [];

            _.bindAll(self, 'render');

            self.model.on('change:viewport', self.render);
        },

        /**
         * Backbone view render method. Begins loading our tiles
         * @return {TileLayer} *this*
         */
        render: function() {
            var model = this.model,
                viewport = model.get('viewport');

            //- add our new tiles
            this._addTiles(viewport);

            return this;
        },

        /**
         * Calculates the top left position in pixel space of the center tile.
         * @param  {yarn.models.Viewport}    viewport   our projectect center point
         * @return {yarn.Point}                         top left pixel position of the center tile             
         */
        calculateTopLeft: function(viewport, tileSize) {
            var topLeftPixelCoord = viewport.getTopLeft();
            return new yarn.Point(
                topLeftPixelCoord.x / tileSize,
                topLeftPixelCoord.y / tileSize
            );
        },

        /**
         * Adds our tiles our view element.
         * @param {yarn.Point} centerPoint       
         * @param {yarn.Point} centerTileTopLeft 
         */
        _addTiles: function() {
            var viewport = this.model.get('viewport'),
                zoom = this.model.get('zoom'),
                width = this.model.get('width'),
                height = this.model.get('height'),
                tileSize = this.model.get('tileSize'),
                dimensions = this.model.get('dimensions'),
                tileXY = this.calculateTopLeft(viewport, tileSize),
                tileX = currX = Math.floor(tileXY.x),
                tileY = Math.floor(tileXY.y),
                left = currLeft = -1 * Math.floor( (tileXY.x - tileX) * tileSize ),
                top = -1 * Math.floor( (tileXY.y - tileY) * tileSize ),
                tile;

            while (top < dimensions.height) {

                while (currLeft < dimensions.width) {
                    tile = new yarn.views.Tile({
                        src: "http://otile1.mqcdn.com/tiles/1.0.0/osm/" + zoom + "/" + currX + "/" + tileY + ".png",
                        top: top,
                        left: currLeft
                    });

                    this.$el.append(tile.render().el);

                    currX += 1;
                    currLeft += tileSize;
                }

                top += 256;
                tileY += 1;

                //- result our vars
                currX = tileX;
                currLeft = left;
            }
        }
    });

})();
(function() {

    var IMG = function() {
        var imageEl = document.createElement('img');
        imageEl.style.position = 'absolute';
        imageEl.draggable = false;

        return imageEl;
    }();

    yarn.views.Tile = Backbone.View.extend({

        /**
         * Our initalizor.
         * @param  {Object} options 
         * @return {void}
         */
        initialize: function(options) {
            this.src = options.src;
            this.top = options.top;
            this.left = options.left;
        },

        /**
         * Destroy this tile.
         * @return {void} 
         */
        dispose: function() {
            var el = this.el,
                parentNode = el.parentNode;

            el.src = null;
            parentNode.removeChild(el);
        },

        /**
         * Render function.
         * @return {Tile} this Tile
         */
        render: function() {
            var el = IMG.cloneNode(false);
            el.src = this.src;
            el.style.top = this.top + 'px';
            el.style.left = this.left + 'px';            

            this.el = el;

            return this;
        }

    });

})();