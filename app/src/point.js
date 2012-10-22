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
        },

        ceil: function() {
            return new Point(Math.ceil(this.x), Math.ceil(this.y));
        }

    };

    return Point;

}());