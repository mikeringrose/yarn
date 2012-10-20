yarn.Zoomable = (function() {
  
  return {

    events: {
      'dblclick':   'zoomIn',
      'mousewheel': 'handleMouseWheel'
    },

    zoomIn: function(evt) {
      this.model.zoomIn();
    },

    zoomOut: function(evt) {
      this.model.zoomIn();
    },    

    handleMouseWheel: _.throttle(
      function(evt) {
        var oe = evt.originalEvent,
            delta = oe.wheelDelta;
        if (delta > 0) {
          this.model.zoomIn();
        }
        else {
          this.model.zoomOut();
        }
      }, 400)
  };

}());