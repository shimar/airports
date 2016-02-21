var Airport = function() {
  this.width  = 800;
  this.height = 500;

  this.vbox_x = 0;
  this.vbox_y = 0;
  this.vbox_default_width  = this.vbox_width  = 800;
  this.vbox_default_height = this.vbox_height = 500;

  this.map = d3.select('#map')
             .append('svg')
             .attr('x', 0)
             .attr('y', 0)
             .attr('width',  this.width)
             .attr('height', this.height)
             .attr('viewBox', '' + this.vbox_x + " " + this.vbox_y + " " + this.vbox_width + " " + this.vbox_height);
  this.map.append('g');

  this.projection = null;
  this.center     = null;
  this.airports   = null;
  this.terminals  = null;
  this.refpoints  = null;

  this.init = function(done) {
    $(window)
    .queue(this.loadJapan.bind(this))
    .queue(this.loadReferencePoints.bind(this))
    .queue(this.loadTerminalBuildings.bind(this))
    .queue(this.loadAirport.bind(this));
    if (done) {
      setTimeout(function() {
        done();
      }, 3000);
    }
  };

  this.loadJapan = function(next) {
    d3.json('json/japan.topojson', this.onLoadJapan.bind(this));
    next();
  };

  this.onLoadJapan = function(err, data) {
    console.log('onLoadJapan() start');
    var subunits = topojson.feature(data, data.objects.japan_subunits);
    this.center = d3.geo.centroid(subunits);
    this.projection = d3.geo.mercator().center(this.center).scale(1000);
    var path = d3.geo.path().projection(this.projection);

    this.map.selectAll('.subunit')
    .data(subunits.features)
    .enter()
    .append('path')
    .attr('class', 'subunit')
    .attr('d', path);
    console.log('onLoadJapan() end.');
  };

  this.loadAirport = function(next) {
    d3.json('json/Airport.json', this.onLoadAirport.bind(this));
    next();
  };

  this.onLoadAirport = function(err, data) {
    this.initAirportList(data);
  };

  this.initAirportList = function(data) {
    var features = data.features;
    var $sidebar    = $('.sidebar');
    var $sidebarNav = $('.sidebar-nav');

    features = _.sortBy(features, function(o) { return o.properties.C28_001; });
    this.airports = features;
    for (index in features) {
      var feature = features[index];
      var props   = feature.properties;
      var anchor  = $('<a href="#" data-index="' + index + '">' + props.C28_005 + '</a>');
      anchor.bind('click', this.onListItemClick.bind(this));
      var li = $('<li></li>');
      li.append(anchor);
      $sidebarNav.append(li);
    }
    $sidebar.perfectScrollbar();
  };

  this.onListItemClick = function(event) {
    var $target   = $(event.target);
    var index     = $target.attr('data-index');
    var feature   = this.airports[index];
    var center    = d3.geo.centroid(feature);
    var coords    = this.projection(center);
    var defCoords = this.projection(this.center);
    var tx = coords[1] - defCoords[1];
    var ty = coords[0] - defCoords[0];
    var trans = 'translate(' + tx + ',' + ty + ')';
    this.map.attr('transform', trans);
    this.projection.center(center);
  };

  this.loadReferencePoints = function(next) {
    d3.json('json/AirportReferencePoint.json', this.onLoadReferencePoints.bind(this));
    next();
  };

  this.onLoadReferencePoints = function(err, data) {
    console.log('onLoadReferencePoint() start.');
    var path = d3.geo.path().projection(this.projection);
    this.map.selectAll('path').data(data.features)
    .enter()
    .append('path')
    .attr('class', 'airport-rp')
    .attr('d', path);
    console.log('onLoadReferencePoint() end.');
  };

  this.loadTerminalBuildings = function(next) {
    d3.json('json/TerminalBuilding.json', this.onLoadTerminalBuildings.bind(this));
    next();
  };

  this.onLoadTerminalBuildings = function(err, data) {
    console.log(data);
  };

  this.zoom = d3.behavior.zoom().on('zoom', function(d) {
              });
  this.map.call(this.zoom);


  // this.drag = function(d) {
  //   this.vbox_x -= d3.event.dx;
  //   this.vbox_y -= d3.event.dy;
  //   return this.map.attr("translate", "100 100");
  // };
  // this.map.call(d3.behavior.drag().on('drag', this.drag.bind(this)));

  return this;
};

$(function() {
    var container = new Container();
    container.init();
    var airport = new Airport();
    airport.init(container.open.bind(container));
}());
