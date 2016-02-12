var Container = function() {
  this.wrapper = $('#wrapper');
  this.cover   = $('#cover');

  this.init = function() {
    this.close();
  };

  this.open = function() {
    this.cover.hide();
    this.wrapper.show();
  };

  this.close = function() {
    this.cover.show();
    this.wrapper.hide();
  };

  return this;
};
