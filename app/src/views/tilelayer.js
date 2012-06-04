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