yarn.models.FeatureCollection = Backbone.Model.extend({

  defaults: {
    /**
     * Name of this feature
     * @type {String}
     */
    id: null,

    /**
     * Whether or not this feature is visible.
     * @type {Boolean}
     */
    visible: true,

    /**
     * The features of this collection.
     * @type {Backbone.Collection}
     */
    features: null
  },

  initialize: function() {
    this.set({features: new yarn.models.Features()});
  }

});