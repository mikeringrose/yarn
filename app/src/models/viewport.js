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