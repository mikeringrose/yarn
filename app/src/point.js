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
         * Non-destructive subtract operation that returns a new point.
         * @param  {yarn.Point}     other   point to subtract
         * @return {yarn.Point}             the resulting point
         */
        subtract: function(other) {
            return new Point(this.x - other.x, this.y - other.y);
        }

    };

    return Point;

}());