yarn.Clickable = (function() {
  
  return {

    events: {
      'dblclick': 'zoomIn'
    },

    zoomIn: function(evt) {
      this.model.zoomIn();
    }

  };

}());