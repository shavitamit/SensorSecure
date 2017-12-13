$(document).ready(function()  {

var viewportWidth = $(window).width();
var viewportHeight = $(window).height()/2;
var width = viewportWidth * .90;
var height = width/1.85;
var centered;

//Define map projection 
var projection = d3.geo.albersUsa();
      projection
      .scale([width])
      .translate([width/2, height/2]);      // scale things down so see entire US
        
// Define path generator
var path = d3.geo.path()               // path generator that will convert GeoJSON to SVG paths
         .projection(projection);  // tell path generator to use albersUsa projection

    
// Define linear scale for output
var color = d3.scale.linear()
        .range(["#D0D0D0", "#FFA100", "#FF8000","#FF5900"]);

var legendText = ["High Vulnerability State", "Mid Vulnerability State", "Low Vulnerability State", "Information Unavailable"];

//Create SVG element and append map to the SVG
var svg = d3.select("#map")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

     
        
// Append Div for tooltip to SVG
var div = d3.select("#map")
        .append("div")   
        .attr("class", "tooltip")               
        .style("opacity", 0);

// Load in my states data!
d3.csv("states.csv", function(data) {
color.domain([0,1,2,3]); // setting the range of the input data

// Load GeoJSON data and merge with states data
d3.json("us-states.json", function(json) {

// Loop through each state data value in the .csv file
for (var i = 0; i < data.length; i++) {

  // Grab State Name
  var dataState = data[i].state;

  // Grab data value 
  var dataValue = data[i].visited;

  // Find the corresponding state inside the GeoJSON
  for (var j = 0; j < json.features.length; j++)  {
    var jsonState = json.features[j].properties.name;

    if (dataState == jsonState) {

    // Copy the data value into the JSON
    json.features[j].properties.visited = dataValue; 

    // Stop looking through the JSON
    break;
    }
  }
}
    
// Bind the data to the SVG and create one path per GeoJSON feature


    var g = svg.append("g");

g.append("g")
      .attr("id", "states")
      .selectAll("path")
  .data(json.features)
  .enter()
  .append("path")
  .attr("d", path)
  .on("click", clicked)
  .style("stroke", "#fff")
  .style("stroke-width", "1")
  .style("fill", function(d) {

  // Get data value
  var value = d.properties.visited;

  if (value) {
  //If value exists…
  return color(value);
  } else {
  //If value is undefined…
  return "rgb(213,222,217)";
  }
});

     
// Map the areas with vulnerability issues
d3.csv("locations.csv", function(data) {

g.selectAll("circle")
  .data(data)
  .enter()
  .append("circle")
  .attr("cx", function(d) {
    return projection([d.lon, d.lat])[0];
  })
  .attr("cy", function(d) {
    return projection([d.lon, d.lat])[1];
  })
  .attr("r", function(d) {
    return Math.sqrt(d.size) * 4;
  })
    .style("fill", "rgba (0,0,0, .7)") 
    .style("stroke", "white") 
    .style("stroke-width","2px")
    .style("opacity", 0.85) 

  // Modification of custom tooltip code provided by Malcolm Maclean, "D3 Tips and Tricks" 
  // http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html
  .on("mouseover", function(d) {      
      div.transition()        
           .duration(200)      
           .style("opacity", .9);      
           div.html(d.ip + "<br />" + d.customer + "<p>" + d.iframe)
           .style("left", (d3.event.pageX) + "px")     
           .style("top", (d3.event.pageY - 28) + "px");    
  })   

    // fade out tooltip on mouse out               
    .on("mouseout", function(d) {       
        div.transition()        
           .duration(4500)      
           .style("opacity", 0);   
    });

 d3.select("#ip").append("div")
          .selectAll("div")
          .data(data)
          .enter()
          .append("div")
          .text(function(d) { return d.ip; });

           d3.select("#url").append("div")
          .selectAll("div")
          .data(data)
          .enter()
          .append("a")
          .attr("href" , (function(d) { return d.url; }))
          .text(function(d) { return d.url; });

              d3.select("#type").append("div")
          .selectAll("div")
          .data(data)
          .enter()

          .append("div")
          .html(function(d) { return  "<a href='" + d.url + "' target='_new'>"   + d.ip + "</a>" + "<br />" + "<strong id='company'>" + d.customer + "</strong>" + "<br />" + d.address + "<br />" + d.phone + "<br /><br />" + "<br />" + "<strong id='company'>" + d.customer2 + "</strong>" + "<br />" + d.address2 + "<br />" + d.phone2 + "<p>" });



});  


function clicked(d) {
  var x, y, k;

  if (d && centered !== d) {
    var centroid = path.centroid(d);
    x = centroid[0];
    y = centroid[1];
    k = 4;
    centered = d;
  } else {
    x = width / 2;
    y = height / 2;
    k = 1;
    centered = null;
  }

  g.selectAll("path")
      .classed("active", centered && function(d) { return d === centered; });


  g.transition()
      .duration(750)
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
      .style("stroke-width", 1.5 / k + "px");
}

d3.select(window).on('resize', resize);

function resize() {
  
    width = parseInt(d3.select('#map').style('width'));
    width = $(window).width() * .90;
    height = width/1.85;
  
   projection
      .scale([width])
      .translate([width/2, height/2]); 

    
   d3.select("#map").attr("width",width).attr("height",height);
   d3.select("svg").attr("width",width).attr("height",height);
  
   d3.selectAll("path").attr('d', path)
   d3.selectAll("circle").attr("cy", function(d) {
    return projection([d.lon, d.lat])[1];
  })
   d3.selectAll("circle").attr("cx", function(d) {
    return projection([d.lon, d.lat])[0];
  })
 

};
        
// Modified Legend Code from Mike Bostock: http://bl.ocks.org/mbostock/3888852
var legend = d3.select("#map").append("svg")
            .attr("class", "legend")
          .attr("width", 140)
          .attr("height", 200)
          .selectAll("g")
          .data(color.domain().slice().reverse())
          .enter()
          .append("g")
          .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);

    legend.append("text")
        .data(legendText)
          .attr("x", 24)
          .attr("y", 9)
          .attr("dy", ".35em")
          .text(function(d) { return d; });
  });



});
});