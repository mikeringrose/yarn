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