(function() {
    
    /**
     * Our core view that represents the "slippy map". 
     * @type {Backbone.View}
     */
    yarn.views.Map = Backbone.View.extend({

        mixins: [ yarn.Zoomable, yarn.Draggable ],

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

            this.featuresLayer = new yarn.views.FeaturesLayer({
                model: this.model,
                collection: this.model.get('features')
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
            layers.append(this.featuresLayer.render().el);
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

            this.layers.css('top', curr.top + offset.y);
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