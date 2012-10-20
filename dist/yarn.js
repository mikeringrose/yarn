/*! PROJECT_NAME - v0.1.0 - 2012-10-20
* http://PROJECT_WEBSITE/
* Copyright (c) 2012 Mike Ringrose; Licensed MIT */

var yarn = {},
    y = yarn;
yarn.LatLng = (function() {
	
	function LatLng(lat, lng) {
		this.lat = lat;
		this.lng = lng;
	}

	return LatLng;

}());

/**
 * Simple point object.
 */
yarn.Point = (function() {
    
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }

    Point.prototype = {

        /**
         * Non-destructive add operation.
         * @param {yarn.Point}  other       point
         * @return {yarn.Poin}  resulting   point object
         */
        add: function(other) {
            return new Point(this.x + other.x, this.y + other.y);
        },

        /**
         * Non-destructive subtract operation that returns a new point.
         * @param  {yarn.Point}     other   point to subtract
         * @return {yarn.Point}             the resulting point
         */
        subtract: function(other) {
            return new Point(this.x - other.x, this.y - other.y);
        },

        /**
         * Non-destructive scalar multiply.
         * @param  {Number}     scalar  to multiply both points by.
         * @return {yarn.Point}         the resulting point
         */
        multiply: function(scalar) {
            return new Point(this.x * scalar, this.y * scalar);
        },

        /**
         * Non-destructive division.
         * @param  {Number}     scalar  to divide by
         * @return {yarn.Point}         results of the division
         */
        divide: function(scalar) {
            return new Point(this.x / scalar, this.y / scalar);
        },

        floor: function() {
            return new Point(Math.floor(this.x), Math.floor(this.y));
        }

    };

    return Point;

}());
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
         * Pan's the map to the supplied lattitude/longitude.
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
/**
 * Our projection name space.
 * @type {Object}
 */
yarn.proj = {};

/**
 * Our projection factory.
 */
yarn.proj.Projection = (function() {

	return {
		get: function(name) {
			var proj;

			if ('spherical mercator' === name) {
				proj = new yarn.proj.SphericalMercator();
			}

			return proj;
		}
	};

}());

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
yarn.proj.SphericalMercator = (function() {

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
        EXTENTS             = new yarn.Point(20037508.34, 20037508.34);

    /**
     * Empty constructor.
     */
    function SphericalMercator() {}

    SphericalMercator.prototype = {     

        /**
         * Returns the resolution given the supplied zoom and tile size.
         * @type {Number}
         */
        getResolution: _.memoize(
            function(zoom, tileSize) {
                return ( 2 * EXTENTS.x / (Math.pow(2, zoom) * tileSize) );
            }
        ),

        getTransformer: function(zoom, tileSize) {
            var resolution = this.getResolution(zoom, tileSize);

            return {

                forward: function(point) {
                    return point.add(EXTENTS).divide(resolution);
                },

                reverse: function(point) {
                    return point.multiply(resolution);
                }

            };
        },

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
}());

yarn.models = {};
yarn.models.Viewport = Backbone.Model.extend({
    
    defaults: {

        /**
         * Projected top of the viewport
         * @type {yarn.Point}
         */
        topLeft: null,
        /**
         * Projected right side of the viewport
         * @type {yarn.Point}
         */
        bottomRight: null,

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
        return transform(this.get('topLeft'));
    },

    /**
     * Returns the pixel coordinates of the bottom right.
     * @return {yarn.Point} bottom right pixel coordinates
     */
    getBottomRight: function() {
        var transform = this.get('transform');
        return transform(this.get('bottomRight'));
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

        zoomOut: function() {
            var zoom = this.get('zoom'),
                minZoom = this.get('minZoom');

            zoom -= 1;

            if (zoom > minZoom) {
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
yarn.Clickable = (function() {
  
  return {

    events: {
      'dblclick':   'zoomIn',
      'mousewheel': 'handleMouseWheel'
    },

    zoomIn: function(evt) {
      this.model.zoomIn();
    },

    zoomOut: function(evt) {
      this.model.zoomIn();
    },    

    handleMouseWheel: _.throttle(
      function(evt) {
        var oe = evt.originalEvent,
            delta = oe.wheelDelta;
        if (delta > 0) {
          this.model.zoomIn();
        }
        else {
          this.model.zoomOut();
        }
      }, 400)
  };

}());
yarn.Draggable = (function() {
  return {
    events: {
      'mousedown':  'dragStart',
      'mouseup':    'dragStop',
      'mousemove':  'drag'
    },

    dragStart: function(evt) {
      this.dragging = true;
      this.$el.css('cursor', 'move');
      this.dragStartX = evt.pageX;
      this.dragStartY = evt.pageY;
    },

    dragStop: function(evt) {
      this.dragging = false;
      this.$el.css('cursor', 'auto');
    },

    drag: function(evt) {
      var currentPoint, delta;

      if (this.dragging) {
        delta = new yarn.Point(evt.pageX - this.dragStartX, this.dragStartY - evt.pageY);
        this.model.moveByPixels(delta);
        this.dragStartX = evt.pageX;
        this.dragStartY = evt.pageY;
      }
    }
  };
}());
yarn.views = {};
(function() {
    
    /**
     * Our core view that represents the "slippy map". 
     * @type {Backbone.View}
     */
    yarn.views.Map = Backbone.View.extend({

        mixins: [ yarn.Clickable, yarn.Draggable ],

        background: "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAKklEQVQokWO8du0aAzZw+fJlrOJMWEXxgFENxAAWXOGtq6tLHRtGNRADALj3CB2z8pZoAAAAAElFTkSuQmCC')",

        /**
         * Our delegated events
         * @type {Object}
         */
        events: {},

        /**
         * Initializer for the map.
         * @param  {Object} options Required is the el element.
         * @return {void}         
         */
        initialize: function(options) {
            var self = this;

            _.bindAll(self);            
            
            this.model.on("change:center", this.update);
            this.model.on("change:zoom", this.reset);

            this.layer = new yarn.views.TileLayer({ 
                model: this.model
            });
        },

        /**
         * Renders the map and loads our tiles.
         * @return {yarn.view.Map} this instance of the map
         */
        render: function() {
            var self = this,
                layers = self.layers = $('<div style="position: absolute"></div>');

            this.$el.css('background-image', this.background);

            self.$el.append(layers);
            layers.append(this.layer.render().el);
        },

        /**
         * Updates the viewport.
         * @return {void} 
         */
        update: function(model, center) {
            var prev = model.previous('center'),
                centerPixels = model.transformLatLngToPixels(center),
                prevPixels = model.transformLatLngToPixels(prev),
                delta = prevPixels.subtract(centerPixels);

            this.move(delta);
        },

        /**
         * Move the map by some offset.
         * @param  {yarn.Point} offset x,y offsets in pixels to move the map
         * @return {void}        
         */
        move: function(offset) {
            var curr = this.layers.position();

            this.layers.css('top', curr.top - offset.y);
            this.layers.css('left', curr.left + offset.x);
        },

        /**
         * Reset the map offsets.
         * @return {void} 
         */
        reset: function() {
            this.layers.css('top', 0);
            this.layers.css('left', 0);
        }
    });

}());
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
            var self = this,
                model = self.model,
                viewport = model.get('viewport');

            self.tiles = {};
            self.origin = viewport.getTopLeft();

            _.bindAll(self, 'render', '_reset', '_move');

            self.model.on('change:center', self._move);
            self.model.on('change:zoom', self._reset);            
        },

        /**
         * Backbone view render method. Begins loading our tiles
         * @return {TileLayer} *this*
         */
        render: function() {
            var model = this.model,
                viewport = model.get('viewport');

            this.$el.css('position', 'relative');
           
            //- add our new tiles
            this._tile(model);

            return this;
        },

        /**
         * Resets the tile container, by disposing of the current tiles and then re-tiles.
         * @param  {Backbone.Model} Model   our model object
         * @param  {Number}         zoom    new zoom value
         * @return {void}       
         */
        _reset: function(model, zoom) {
            var viewport = model.get('viewport');

            _.invoke(this.tiles, 'dispose');

            this.tiles = {};
            this.origin = viewport.getTopLeft();

            this._tile(model);
        },

        /**
         * Moves the tile layer.
         * @param  {Backbone.Model} model   the map model
         * @param  {yarn.Point}     center  map center in projected space
         * @return {void}        
         */
        _move: function(model, center) {
            this._tile(model);
        },

        /**
         * Places all of the tiles on the screen.
         * @param  {Backbone.Model} model the map model.
         * @return {void}       
         */
        _tile: function(model) {
            var zoom = model.get('zoom'),
                viewport = model.get('viewport'),
                tileSize = model.get('tileSize'),
                startXY = this._calculateTopLeft(),
                startPos = startXY.multiply(tileSize),
                boundsSE = viewport.getBottomRight(),
                queue = [],
                top, left, tileX, tileY, key, tile;

            for (top = startPos.y, tileY = startXY.y; top <= boundsSE.y; top += tileSize, tileY += 1) {
                for (left = startPos.x, tileX = startXY.x; left <= boundsSE.x; left += tileSize, tileX += 1) {
                    key = zoom + "/" + tileX + "/" + tileY;

                    if (!this.tiles[key]) {
                        tile = this._createTile(key, this._getTileTopLeft(top, left));
                        queue.push(tile);

                        this.tiles[key] = tile;
                    }
                }
            }
            
            this._addTiles(queue);
        }, 

        /**
         * Adds the tiles to the container.
         * @param {Array} queue array of tiles to add
         */
        _addTiles: function(queue) {
            var tile;

            while (tile = queue.pop()) {
                this.$el.append(tile.render().el);
            }
        },    

        /**
         * Returns the top, left position relative to the origin.
         * @param  {Backbone.Model}     model   our map model
         * @param  {Number} top         top     position of the tile
         * @param  {Left} left          left    most position of the tile
         * @return {yarn.Point}         new point relative to the origin
         */
        _getTileTopLeft: function(top, left) {
            var tileTopLeft = new yarn.Point(left, top);
            return tileTopLeft.subtract(this.origin);
        },


        /*
        _tile: function(model) {
            var zoom = model.get('zoom'),
                tileSize = model.get('tileSize'),
                tileXY = this._calculateTopLeft(),
                tileX = Math.floor(tileXY.x),
                tileY = Math.floor(tileXY.y),
                startTop = -Math.floor((tileXY.y - tileY) * tileSize),
                startLeft = -Math.floor((tileXY.x - tileX) * tileSize),
                dimensions = model.get('dimensions'),
                height = dimensions.height,
                width = dimensions.width,
                tileContainer = this.$el.find('div:first-child'),
                top, left, tile, key;

            //- window.console.log(tileXY.floor().multiply(tileSize).subtract(model.get('viewport').getTopLeft()));

            for (top = startTop; top < height; top += tileSize, tileY += 1) {

                for (left = startLeft, tileX = Math.floor(tileXY.x); left < width; left += tileSize, tileX += 1) {
                    key = zoom + "/" + tileX + "/" + tileY;

                    if (!(tile = this.tiles[key])) {
                        tile = this._createTile(key, top, left);
                        this.tiles[key] = tile;
                        tileContainer.append(tile.render().el);
                    }
                }
            }
        },

        */
        /**
         * Private factory method for creating a new tile.
         * @param  {path} path osm standard path to the tile image
         * @param  {Number} top         y coordinate of the tile
         * @param  {Number} left        x coordinate of the tile
         * @return {yarn.views.Tile}    a new tile
         */
        _createTile: function(path, topLeft) {
            return new yarn.views.Tile({
                src: "http://otile1.mqcdn.com/tiles/1.0.0/osm/" + path + ".png",
                topLeft: topLeft
            });
        },

        /**
         * Calculates the top left position in pixel space of the top left most tile.
         * @return {yarn.Point} top left pixel position of the center tile             
         */
        _calculateTopLeft: function() {
            var model = this.model,
                viewport = model.get('viewport'),
                tileSize = model.get('tileSize');

            return viewport.getTopLeft().divide(tileSize).floor();
        }

    });

}());
(function() {
    var IMG = (function() {
        var imageEl = document.createElement('img');
        imageEl.style.position = 'absolute';
        imageEl.draggable = false;

        return imageEl;
    }());

    yarn.views.Tile = Backbone.View.extend({

        /**
         * Our initalizor.
         * @param  {Object} options 
         * @return {void}
         */
        initialize: function(options) {
            this.src = options.src;
            this.topLeft = options.topLeft;
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
            el.style.top = this.topLeft.y + 'px';
            el.style.left = this.topLeft.x + 'px';            

            this.el = el;

            return this;
        },

        update: function(top, left) {
            var el = this.el;
            el.style.top = this.top + 'px';
            el.style.left = this.left + 'px';
        }

    });

}());