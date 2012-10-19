yarn.Draggable = (function() {
  return {
    events: {
      'mousedown':  'dragStart',
      'mouseup':    'dragStop',
      'mousemove':  'drag'
    },

    dragStart: function(evt) {
      this.dragging = true;
      this.$el.css('cursor', 'move');
      this.dragStartX = evt.pageX;
      this.dragStartY = evt.pageY;
    },

    dragStop: function(evt) {
      this.dragging = false;
      this.$el.css('cursor', 'auto');
    },

    drag: function(evt) {
      var currentPoint, delta;

      if (this.dragging) {
        delta = new yarn.Point(evt.pageX - this.dragStartX, this.dragStartY - evt.pageY);
        this.model.moveByPixels(delta);
        this.dragStartX = evt.pageX;
        this.dragStartY = evt.pageY;
      }
    }
  };
}());