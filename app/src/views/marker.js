yarn.views.Marker = Backbone.View.extend({

  className: "css marker",
  
  events: {
    'click': 'handleClick'
  },

  render: function() {
    var pos = this.options.pos;

    this.$el.css('top', (pos.y - 18) + 'px');
    this.$el.css('left', (pos.x - 12)+ 'px');

    return this;
  },

  handleClick: function() {
    window.alert('boom');
  }

});