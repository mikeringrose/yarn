yarn.views.FeaturesLayer = Backbone.View.extend({

  attributes: {
    'style': 'position: relative' 
  },

  initialize: function() {
    var model = this.model,
        collection = this.collection,
        viewport = model.get('viewport');

    _.bindAll(this);

    this.origin = viewport.getTopLeft();

    model.on('change:zoom', this.reset);
    collection.on('add', this.onNewFeatureCollection);
  },

  render: function() {
    return this;
  },

  onNewFeatureCollection: function(featureCollection) {
    var features = featureCollection.get('features');
    features.on('add', this.addFeature);
    features.on('remove', this.removeFeature);
  },

  addFeature: function(feature) {
    var pos = this.getMarkerPosition(feature),
        markerView = new yarn.views.Marker({ model: feature, pos: pos});

    this.$el.append(markerView.render().el);
  },

  removeFeature: function(feature) {

  },

  getMarkerPosition: function(marker) {
    var model = this.model,
        viewport = model.get('viewport'),
        latLng = marker.get('latLng'),
        pixelPos = model.transformLatLngToPixels(latLng);

    return pixelPos.subtract(this.origin);
  },

  reset: function(model) {
    var self = this,
        viewport = model.get('viewport'),
        features;

    this.$el.empty();

    this.origin = viewport.getTopLeft();

    this.collection.each(function(featureCollection) {
      features = featureCollection.get('features');

      features.each(function(feature) {
        self.addFeature(feature);
      });
    });
  }

});