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
            this.tiles = [];
            this.proj = options.proj;

            _.bindAll(this, [ 'render' ]);

            this.model.on('change:zoom change:center change:dimensions', this.render);
        },

        /**
         * Backbone view render method. Begins loading our tiles
         * @return {TileLayer} *this*
         */
        render: function() {
            var model = this.model,
                zoom = model.get('zoom'),
                tileSize = model.get('tileSize'),
                dimensions = model.get('dimensions'),
                centerPoint = this._calculateCenterPoint(),
                centertPixelPoint = this._calculateCenterPixelPoint(centerPoint);

            this._addTiles(centerPoint, centertPixelPoint);

            return this;
        },

        /**
         * Calculates the projected center point.
         * @param  {Number}             zoom        current zoom level
         * @param  {yarn.core.Point}    dimensions  the dimensions of the map
         * @param  {Number}             tileSize    size of our tiles
         * @return {yarn.core.Point}                our projected center
         */
        _calculateCenterPoint: function() {
            var zoom = this.model.get('zoom'),
                numTiles = Math.pow(2, zoom),            
                tileSize = this.model.get('tileSize'),
                centerLatLng = this.model.get('center'),
                projPoint = this.proj.project(centerLatLng);

            return new yarn.core.Point(
                    (projPoint.x + Math.PI) / (2 * Math.PI) * numTiles, 
                    projPoint.y / 2 * numTiles
                );
        },        

        /**
         * Calculates the top left position in pixel space of the center tile.
         * @param  {yarn.core.Point}    centerPoint     our projectect center point
         * @return {yarn.core.Point}                    top left pixel position of the center tile             
         */
        _calculateCenterPixelPoint: function(centerPoint) {
            var tileSize = this.model.get('tileSize'),
                dimensions = this.model.get('dimensions');

            return new yarn.core.Point(
                Math.round(dimensions.width / 2 - (centerPoint.x - Math.floor(centerPoint.x)) * tileSize), 
                Math.round(dimensions.height / 2 - (centerPoint.y - Math.floor(centerPoint.y)) * tileSize)
            );
        },

        /**
         * Calculates the top positions of the layer in both tile and pixel space.
         * @param  {yarn.core.Point} centerPoint        projected center point
         * @param  {yarn.core.Point} centerTileTopLeft  pixel space top left point
         * @return {Object}                             Object that holds the "tile" and "pixel" coordinates
         */
        _calculateLayerPositions: function(centerPoint, centerTileTopLeft) {
            var tileSize = this.model.get('tileSize'),
                tilesLeft = Math.ceil(centerTileTopLeft.x / tileSize),
                tilesUp = Math.ceil(centerTileTopLeft.y / tileSize),
                left = Math.floor(centerPoint.x) - tilesLeft,
                top = Math.floor(centerPoint.y) - tilesUp;

            return {
                    tile: new yarn.core.Point(left, top),
                    pixel: new yarn.core.Point(centerTileTopLeft.x - tilesLeft * tileSize, centerTileTopLeft.y - tilesUp * tileSize)
                };
        },

        /**
         * Adds our tiles our view element.
         * @param {yarn.core.Point} centerPoint       
         * @param {yarn.core.Point} centerTileTopLeft 
         */
        _addTiles: function(centerPoint, centerTileTopLeft) {
            var zoom = this.model.get('zoom'),
                tileSize = this.model.get('tileSize'),
                dimensions = this.model.get('dimensions'),
                layerPosition = this._calculateLayerPositions(centerPoint, centerTileTopLeft),
                layerTopLeftPixels = layerPosition.pixel,
                layerTopLeftTile = layerPosition.tile,
                col = 0, 
                row = 0, 
                currentX,
                tile;

            //- empty out any existing tiles
            this.$el.empty();

            //- add in our tiles row major order
            while (layerTopLeftPixels.y < dimensions.height) {
                currentX = layerTopLeftPixels.x;

                while (currentX < dimensions.width) {

                    tile = new yarn.views.Tile({
                        src: "http://otile1.mqcdn.com/tiles/1.0.0/osm/" + zoom + "/" + (layerTopLeftTile.x + col) + "/" + (layerTopLeftTile.y + row) + ".png",
                        top: Math.floor(layerTopLeftPixels.y),
                        left: Math.floor(currentX)
                    });

                    this.$el.append(tile.render().el);

                    this.tiles.push(tile);

                    currentX += tileSize;
                    col += 1;
                }

                layerTopLeftPixels.y += tileSize;
                row += 1;
                col = 0;
            }
        }
    });

})();