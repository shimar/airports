$(function() {
    var g;
    var width  = '100%';
    var height = 800;
    var map = d3.select('#map').append('svg')
              .attr('width', width)
              .attr('height', height)
              .append('g');
    d3.json('json/Airport.json', function(err, data) {
      var projection, path;
      projection = d3.geo.mercator()
                   .scale(1000)
                   .center(d3.geo.centroid(data));
      path = d3.geo.path().projection(projection);

      map.selectAll('path').data(data.features)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('stroke', 'blue')
      .attr('fill', 'rgba(0, 0, 255, .5)');
    });
}());
