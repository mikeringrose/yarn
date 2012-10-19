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