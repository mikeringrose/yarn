document.addEventListener("DOMContentLoaded", function() {
    var mapEl = document.getElementById('map'),
        lat = 40.039722,
        lng = -76.304444,
        center = new yarn.LatLng(lat, lng),
        options = {
            el: mapEl,
            center: center,
            zoom: 16,
            tileSize: 256
        },
        map = new yarn.Map(options);

        setTimeout(function() { 
            map.setZoom(8); 
        }, 1500);
});