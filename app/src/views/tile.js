(function() {

    var PTILE = function() {
        var imageEl = document.createElement('img');
        imageEl.style.position = 'absolute';

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
            var el = PTILE.cloneNode();
            el.src = this.src;
            el.style.top = this.top + 'px';
            el.style.left = this.left + 'px';            

            this.el = el;

            return this;
        }

    });

})();