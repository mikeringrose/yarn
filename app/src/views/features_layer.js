yarn.views.FeaturesLayer = Backbone.View.extend({

  attributes: {
    'style': 'position: relative' 
  },

  initialize: function() {
    var model = this.model,
        viewport = model.get('viewport');

    _.bindAll(this);
    this.origin = viewport.getTopLeft();
    this.collection.on('add', this.addMarker);
  },

  render: function() {
    return this;
  },

  addMarker: function(marker) {
    var pos = this.getMarkerPosition(marker),
        markerView = new yarn.views.Marker({ model: marker, pos: pos});

    this.$el.append(markerView.render().el);
  },

  getMarkerPosition: function(marker) {
    var model = this.model,
        viewport = model.get('viewport'),
        latLng = marker.get('latLng'),
        pixelPos = model.transformLatLngToPixels(latLng);

    return pixelPos.subtract(this.origin).floor();
  }

});