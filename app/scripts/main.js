var Airport = function() {
  this.width  = '100%';
  this.height = 500;

  this.vbox_x = 0;
  this.vbox_y = 0;
  this.vbox_default_width  = this.vbox_width  = 800;
  this.vbox_default_height = this.vbox_height = 500;

  this.map = d3.select('#map')
             .append('svg')
             .attr('width',  this.width)
             .attr('height', this.height);
             // .attr('viewBox', '' + this.vbox_x + " " + this.vbox_y + " " + this.vbox_width + " " + this.vbox_height);
  this.projection = null;
  this.center     = null;
  this.airports   = null;
  this.terminals  = null;
  this.refpoints  = null;

  this.zoom = d3.behavior.zoom()
              .scaleExtent([1, 8])
              .on('zoom', this.zoomed);

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
    var center    = this.projection(d3.geo.centroid(feature));

    var direction  = 1;
    var factor     = 0.2;
    var targetZoom = 1;
    var extent     = this.zoom.scaleExtent();
    var translate  = this.zoom.translate();
    var translate0 = [];
    var l          = [];
    var view = { x: translate[0], y: translate[1], k: this.zoom.scale() };

    console.log(this.zoom.scale());
    console.log(this.zoom.translate());
    // targetZoom = this.zoom.scale() * (4 + factor * direction);
    targetZoom = 8;

    translate0 = [
      (center[0] - view.x) / view.k,
      (center[1] - view.y) / view.k
    ];
    view.k = targetZoom;
    console.log("c :" + center);
    console.log("t0:" + translate0);

    l = [
      translate0[0] * view.k + view.x,
      translate0[1] * view.k + view.y
    ];
    console.log("l :" + l);
    view.x += center[0] - l[0];
    view.y += center[1] - l[1];

    console.log("v :" + view.x + ", " + view.y + ", " + view.k);
    this.interpolateZoom([view.x, view.y], view.k);
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

  this.interpolateZoom = function(translate, scale) {
    var zoom   = this.zoom;
    var zoomed = this.zoomed.bind(this);
    return d3.transition().duration(350).tween('zoom', function() {
             var itranslate = d3.interpolate(zoom.translate(), translate);
             var iscale     = d3.interpolate(zoom.scale(), scale);
             return function(t) {
               zoom.scale(iscale(t)).translate(itranslate(t));
               zoomed();
             };
           });
  };

  this.zoomed = function() {
    this.map.attr('transform',
                 "translate(" + this.zoom.translate() + ")" +
                 " scale(" + this.zoom.scale() + ")");
  };

  return this;
};

$(function() {
    var container = new Container();
    container.init();
    var airport = new Airport();
    airport.init(container.open.bind(container));
}());
