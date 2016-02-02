var Airport = function() {
  this.width  = '100%';
  this.height = $(window).height();
  this.map = d3.select('#map').append('svg')
             .attr('width', this.width)
             .attr('height', this.height);

  this.onLoadAirport = function(err, data) {
    this.initMap(data);
    this.initAirportList(data);
  };

  this.initMap = function(data) {
    var projection, path;
    projection = d3.geo.mercator()
                 .scale(1000)
                 .center(d3.geo.centroid(data));
    path = d3.geo.path().projection(projection);

    this.map.selectAll('path').data(data.features)
    .enter()
    .append('path')
    .attr('d', path)
    .attr('stroke', 'blue')
    .attr('fill', 'rgba(0, 0, 255, .5)');
  };

  this.initAirportList = function(data) {
    var features = data.features;
    var $sidebarNav = $('.sidebar-nav');

    for (index in features) {
      var feature = features[index];
      var props   = feature.properties;
      var li = $('<li><a href="#">' + props.C28_005 + '</a></li>');
      $sidebarNav.append(li);
    }
  };

  this.loadAirport = function() {
    d3.json('json/Airport.json', this.onLoadAirport.bind(this));
  };

  return this;
};

$(function() {
    var airport = new Airport();
    airport.loadAirport();
}());
