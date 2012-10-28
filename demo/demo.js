document.addEventListener("DOMContentLoaded", function() {
    var mapEl = document.getElementById('map'),
        center = new yarn.LatLng(40.039722, -76.304444),
        options = { el: mapEl, center: center, zoom: 16, tileSize: 256 },
        map = new yarn.Map(options);
        
        map.addMarker({ latLng: center });
});