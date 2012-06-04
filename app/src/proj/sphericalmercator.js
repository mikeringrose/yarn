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
        EXTENTS             = { x: 20037508.34, y: 20037508.34 };

    /**
     * Empty constructor.
     */
    function SphericalMercator() {}

    SphericalMercator.prototype = {     

        /**
         * Returns the resolution given the supplied zoom and tile size.
         * @type {[type]}
         */
        getResolution: _.memoize(
            function(zoom, tileSize) {
                return ( 2 * EXTENTS.x / (Math.pow(2, zoom) * tileSize) );
            }
        ),

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
