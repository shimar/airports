var Airport = function() {
  this.width  = '100%';
  this.height = $(window).innerHeight();
  this.map = d3.select('#map').append('svg')
             .attr('width', this.width)
             .attr('height', this.height);
  this.center = null;

  this.onLoadAirport = function(err, data) {
    this.initMap(data);
    this.initAirportList(data);
  };

  this.initMap = function(data) {
    var projection = d3.geo.mercator()
                     .scale(1000)
                     .center(this.center);
    var path = d3.geo.path().projection(projection);

    this.map.selectAll('path').data(data.features)
    .enter()
    .append('path')
    .attr('d', path)
    .attr('stroke', 'blue')
    .attr('fill', 'rgba(0, 0, 255, .5)');
  };

  this.initAirportList = function(data) {
    var features = data.features;
    var $sidebar    = $('.sidebar');
    var $sidebarNav = $('.sidebar-nav');

    features = _.sortBy(features, function(o) { return o.properties.C28_001; });
    for (index in features) {
      var feature = features[index];
      var props   = feature.properties;
      var li = $('<li><a href="#">' + props.C28_005 + '</a></li>');
      $sidebarNav.append(li);
    }
    $sidebar.perfectScrollbar();
  };

  this.loadAirport = function() {
    d3.json('json/Airport.json', this.onLoadAirport.bind(this));
  };

  this.onLoadJapan = function(err, data) {
    var subunits = topojson.feature(data, data.objects.japan_subunits);
    this.center = d3.geo.centroid(subunits);
    var projection = d3.geo.mercator().center(this.center).scale(1000);
    var path = d3.geo.path().projection(projection);

    console.log(subunits);
    this.map.selectAll('.subunit')
    .data(subunits.features)
    .enter()
    .append('path')
    .attr('class', 'subunit')
    .attr('d', path);
  };

  this.loadJapan = function() {
    d3.json('json/japan.topojson', this.onLoadJapan.bind(this));
  };

  return this;
};

$(function() {
    var airport = new Airport();
    airport.loadJapan();
    airport.loadAirport();
}());
